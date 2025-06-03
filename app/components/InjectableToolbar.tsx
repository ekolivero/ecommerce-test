'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { executeCodingAgent, executeCodingAgentWithAnalysis } from '../actions/codex';

// Types for the metadata that the SWC plugin adds
interface ComponentMetadata {
  id: string;
  component: string;
  file: string;
  line: number;
}

interface ElementHighlight {
  element: HTMLElement;
  metadata: ComponentMetadata;
  rect: DOMRect;
}

interface ToolbarConfig {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'bottom-center';
  theme?: 'light' | 'dark';
  autoActivate?: boolean;
  onElementSelected?: (elements: ElementHighlight[]) => void;
  onModificationComplete?: (result: any) => void;
}

class InjectableToolbar {
  private container: HTMLDivElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private isActive = false;
  private selectedElements: ElementHighlight[] = [];
  private hoveredElement: ElementHighlight | null = null;
  private config: ToolbarConfig;
  private reactRoot: any = null;
  private userRequest = '';
  private isProcessing = false;
  private isExpanded = false;

  constructor(config: ToolbarConfig = {}) {
    this.config = {
      position: 'bottom-center',
      theme: 'light',
      autoActivate: false,
      ...config
    };
  }

  // Initialize the toolbar
  public init(): void {
    if (this.container) {
      console.warn('Toolbar already initialized');
      return;
    }

    this.createContainer();
    this.createOverlay();
    this.setupEventListeners();
    this.render();

    if (this.config.autoActivate) {
      this.activate();
    }

    console.log('Injectable Toolbar initialized');
  }

  // Destroy the toolbar
  public destroy(): void {
    this.deactivate();
    this.removeEventListeners();
    
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }

  // Activate element detection
  public activate(): void {
    this.isActive = true;
    this.render();
  }

  // Deactivate element detection
  public deactivate(): void {
    this.isActive = false;
    this.selectedElements = [];
    this.hoveredElement = null;
    this.render();
  }

  // Toggle activation state
  public toggle(): void {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.id = 'injectable-toolbar-container';
    this.container.style.cssText = `
      position: fixed;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      ${this.getPositionStyles()}
      transition: all 0.2s ease;
    `;
    document.body.appendChild(this.container);
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.id = 'injectable-toolbar-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999998;
    `;
    document.body.appendChild(this.overlay);
  }

  private getPositionStyles(): string {
    const positions = {
      'top-right': 'top: 16px; right: 16px;',
      'top-left': 'top: 16px; left: 16px;',
      'bottom-right': 'bottom: 16px; right: 16px;',
      'bottom-left': 'bottom: 16px; left: 16px;',
      'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
    };
    return positions[this.config.position || 'bottom-center'];
  }

  private setupEventListeners(): void {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('scroll', this.updatePositions, true);
    window.addEventListener('resize', this.updatePositions);
  }

  private removeEventListeners(): void {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('scroll', this.updatePositions, true);
    window.removeEventListener('resize', this.updatePositions);
  }

  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.isActive) {
      this.hoveredElement = null;
      this.render();
      return;
    }

    const element = this.getElementAtPoint(event.clientX, event.clientY);
    if (!element) {
      this.hoveredElement = null;
      this.render();
      return;
    }

    const metadata = this.parseElementMetadata(element);
    if (!metadata) {
      this.hoveredElement = null;
      this.render();
      return;
    }

    const rect = element.getBoundingClientRect();
    this.hoveredElement = { element, metadata, rect };
    this.render();
  };

  private handleClick = (event: MouseEvent): void => {
    if (!this.isActive || !this.hoveredElement) return;

    // Don't interfere with toolbar clicks
    if (this.container?.contains(event.target as Node)) return;

    event.preventDefault();
    event.stopPropagation();

    const isSelected = this.selectedElements.some(
      sel => sel.element === this.hoveredElement!.element
    );

    if (isSelected) {
      this.selectedElements = this.selectedElements.filter(
        sel => sel.element !== this.hoveredElement!.element
      );
    } else {
      this.selectedElements.push(this.hoveredElement);
    }

    this.config.onElementSelected?.(this.selectedElements);
    this.render();
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.selectedElements = [];
      this.hoveredElement = null;
      this.render();
    }
  };

  private updatePositions = (): void => {
    this.selectedElements = this.selectedElements.map(selected => ({
      ...selected,
      rect: selected.element.getBoundingClientRect()
    }));

    if (this.hoveredElement) {
      this.hoveredElement = {
        ...this.hoveredElement,
        rect: this.hoveredElement.element.getBoundingClientRect()
      };
    }

    this.render();
  };

  private getElementAtPoint(x: number, y: number): HTMLElement | null {
    const elementsAtPoint = document.elementsFromPoint(x, y);
    
    for (const element of elementsAtPoint) {
      if (element instanceof HTMLElement && 
          element.hasAttribute('data-pm-edit') &&
          !this.container?.contains(element) &&
          !this.overlay?.contains(element)) {
        return element;
      }
    }
    
    return null;
  }

  private parseElementMetadata(element: HTMLElement): ComponentMetadata | null {
    const dataAttr = element.getAttribute('data-pm-edit');
    if (!dataAttr) return null;
    
    try {
      return JSON.parse(dataAttr) as ComponentMetadata;
    } catch (error) {
      console.warn('Failed to parse element metadata:', error);
      return null;
    }
  }

  private async applyModifications(): Promise<void> {
    if (this.selectedElements.length === 0 || !this.userRequest.trim()) {
      this.showNotification('Please select elements and enter a request');
      return;
    }

    console.log('🚀 Starting applyModifications - setting isProcessing to true');
    this.isProcessing = true;
    this.render();

    try {
      const elementsInfo = this.selectedElements.map(sel => ({
        component: sel.metadata.component,
        file: sel.metadata.file,
        line: sel.metadata.line,
        element: sel.element.tagName.toLowerCase(),
        position: `${Math.round(sel.rect.left)}x${Math.round(sel.rect.top)}`,
        size: `${Math.round(sel.rect.width)}x${Math.round(sel.rect.height)}`,
        classes: sel.element.className || 'none'
      }));

      // Create a ModificationRequest object for Claude Code analysis
      const modificationRequest = {
        userRequest: this.userRequest,
        selectedElements: elementsInfo
      };

      console.log('📤 Sending modification request to Claude Code:', modificationRequest);
      
      const result = await executeCodingAgentWithAnalysis(modificationRequest);

      console.log('✅ Claude Code execution completed, processing result...');
      // Always log the full result for debugging
      console.log('📥 Full Claude Code Result:', result);

      if (result.success) {
        // Log the actual output content
        console.log('📝 Claude Code Output:', result.output);
        
        // Create detailed success message with metadata
        let successMessage = '✅ Changes applied successfully';
        
        if (result.cost) {
          successMessage += ` (Cost: $${result.cost.toFixed(4)})`;
        }
        
        if (result.duration) {
          successMessage += ` (Duration: ${result.duration}ms)`;
        }
        
        this.showNotification(successMessage);
        
        // Log detailed response for debugging
        console.log('🎉 Claude Code Response Metadata:', {
          sessionId: result.sessionId,
          cost: result.cost,
          duration: result.duration,
          outputLength: result.output?.length || 0
        });
        
        // Call the completion callback with full result
        this.config.onModificationComplete?.(result);
        
        // Clear selections after successful modification
        this.selectedElements = [];
        this.userRequest = '';
        
        console.log('✅ Success handling complete, setting isProcessing to false');
      } else {
        // Enhanced error message
        const errorMessage = `❌ Failed to apply changes: ${result.error || 'Unknown error'}`;
        this.showNotification(errorMessage);
        
        // Log error details for debugging
        console.error('💥 Claude Code Error Details:', {
          error: result.error,
          output: result.output,
          outputLength: result.output?.length || 0
        });
        
        // Also log the output even on failure for debugging
        if (result.output) {
          console.log('📝 Claude Code Output (despite error):', result.output);
        }
        
        console.log('❌ Error handling complete, setting isProcessing to false');
      }
    } catch (error) {
      console.error('💥 Exception in applyModifications:', error);
      this.showNotification('❌ Failed to execute - Check console for details');
      console.log('💥 Exception handling complete, setting isProcessing to false');
    } finally {
      console.log('🏁 Finally block: setting isProcessing to false and re-rendering');
      this.isProcessing = false;
      this.render();
      console.log('🏁 Finally block complete, isProcessing is now:', this.isProcessing);
      
      // Force a re-render after a small delay to ensure UI updates
      setTimeout(() => {
        console.log('🔄 Delayed re-render to ensure UI updates');
        this.render();
      }, 100);
    }
  }

  private handleRequestInput = (event: Event): void => {
    const target = event.target as HTMLTextAreaElement;
    this.userRequest = target.value;
  };

  private showNotification(message: string): void {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      color: #374151;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000000;
      font-family: inherit;
      font-size: 14px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      animation: slideIn 0.2s ease-out;
    `;
    
    // Add animation keyframes
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideIn 0.2s ease-out reverse';
      setTimeout(() => notification.remove(), 200);
    }, 2500);
  }

  private render(): void {
    if (!this.container || !this.overlay) return;

    console.log('🎨 Rendering toolbar, isProcessing:', this.isProcessing, 'selectedElements:', this.selectedElements.length);

    const hasSelections = this.selectedElements.length > 0;
    const shouldShowExpanded = this.isExpanded || hasSelections;

    // Render minimal toolbar UI
    this.container.innerHTML = `
      <div style="
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        color: #374151;
        overflow: hidden;
        transition: all 0.2s ease;
        min-width: ${shouldShowExpanded ? '360px' : '240px'};
        max-width: 480px;
      ">
        <!-- Main Toolbar Header -->
        <div style="
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: ${shouldShowExpanded ? '1px solid #f3f4f6' : 'none'};
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="
              width: 24px;
              height: 24px;
              background: ${this.isActive ? '#10b981' : '#9ca3af'};
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: white;
            ">🎯</div>
            <div>
              <h3 style="margin: 0; font-weight: 500; font-size: 14px; color: #111827;">Element Detector</h3>
              <p style="margin: 0; font-size: 11px; color: #6b7280;">
                ${document.querySelectorAll('[data-pm-edit]').length} elements available
              </p>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 6px;">
            ${hasSelections ? `
              <button id="expand-btn" style="
                padding: 4px 6px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                background: white;
                color: #6b7280;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.15s;
              ">
                ${this.isExpanded ? '▼' : '▲'}
              </button>
            ` : ''}
            
            <button id="toggle-btn" style="
              padding: 4px 12px;
              border: 1px solid ${this.isActive ? '#10b981' : '#d1d5db'};
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.15s;
              background: ${this.isActive ? '#10b981' : 'white'};
              color: ${this.isActive ? 'white' : '#374151'};
            ">
              ${this.isActive ? 'Active' : 'Activate'}
            </button>
          </div>
        </div>

        <!-- Status Indicator -->
        ${this.isActive ? `
          <div style="
            background: #f0fdf4;
            border-left: 3px solid #10b981;
            padding: 8px 16px;
            font-size: 11px;
            color: #166534;
            ${shouldShowExpanded ? 'border-bottom: 1px solid #f3f4f6;' : ''}
          ">
            <span><strong>Detection Active</strong> • Hover to highlight • Click to select • ESC to clear</span>
          </div>
        ` : ''}

        <!-- Hovered Element Info -->
        ${this.hoveredElement ? `
          <div style="
            background: #fef3c7;
            border-left: 3px solid #f59e0b;
            padding: 8px 16px;
            font-size: 11px;
            color: #92400e;
            ${shouldShowExpanded ? 'border-bottom: 1px solid #f3f4f6;' : ''}
          ">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 12px;">👆</span>
              <div>
                <strong>${this.hoveredElement.metadata.component}</strong>
                <span style="color: #a16207; margin-left: 4px;">${this.hoveredElement.metadata.file}:${this.hoveredElement.metadata.line}</span>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Expanded Content -->
        ${shouldShowExpanded ? `
          <div style="padding: 16px;">
            ${hasSelections ? `
              <!-- Selected Elements -->
              <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <h4 style="margin: 0; font-weight: 500; font-size: 12px; color: #374151;">
                    Selected (${this.selectedElements.length})
                  </h4>
                  <button id="clear-btn" style="
                    background: none;
                    border: none;
                    color: #dc2626;
                    font-size: 11px;
                    cursor: pointer;
                    padding: 2px 4px;
                    border-radius: 3px;
                    transition: all 0.15s;
                  ">Clear all</button>
                </div>
                
                <div style="
                  max-height: 120px;
                  overflow-y: auto;
                  margin-bottom: 12px;
                ">
                  ${this.selectedElements.map((sel, index) => `
                    <div style="
                      background: #f9fafb;
                      border: 1px solid #e5e7eb;
                      border-radius: 4px;
                      padding: 8px;
                      margin-bottom: 4px;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      font-size: 11px;
                    ">
                      <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                          <span style="
                            background: #10b981;
                            color: white;
                            width: 16px;
                            height: 16px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 9px;
                            font-weight: 600;
                          ">${index + 1}</span>
                          <strong style="color: #111827;">${sel.metadata.component}</strong>
                        </div>
                        <div style="color: #6b7280; font-size: 10px; margin-left: 22px;">
                          ${sel.metadata.file}:${sel.metadata.line}
                        </div>
                      </div>
                      <button data-remove="${index}" style="
                        background: none;
                        border: none;
                        color: #dc2626;
                        cursor: pointer;
                        font-size: 14px;
                        padding: 2px;
                        border-radius: 2px;
                        transition: all 0.15s;
                      ">×</button>
                    </div>
                  `).join('')}
                </div>

                <!-- Request Input -->
                <div style="margin-bottom: 12px;">
                  <label style="
                    display: block;
                    font-weight: 500;
                    font-size: 11px;
                    margin-bottom: 4px;
                    color: #374151;
                  ">What would you like to change?</label>
                  <textarea id="user-request" placeholder="e.g., Change the button color to blue, add a border, make it larger..." style="
                    width: 100%;
                    min-height: 60px;
                    padding: 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 12px;
                    font-family: inherit;
                    background: white;
                    color: #374151;
                    resize: vertical;
                    box-sizing: border-box;
                    transition: border-color 0.15s;
                  " onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor='#d1d5db'">${this.userRequest}</textarea>
                </div>

                <!-- Apply Button -->
                <button id="apply-btn" style="
                  width: 100%;
                  padding: 8px;
                  background: ${this.isProcessing ? '#f3f4f6' : '#10b981'};
                  color: ${this.isProcessing ? '#9ca3af' : 'white'};
                  border: 1px solid ${this.isProcessing ? '#e5e7eb' : '#10b981'};
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: 500;
                  cursor: ${this.isProcessing ? 'not-allowed' : 'pointer'};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 6px;
                  transition: all 0.15s;
                " ${this.isProcessing ? 'disabled' : ''}>
                  ${this.isProcessing ? `
                    <div style="
                      width: 12px;
                      height: 12px;
                      border: 2px solid #e5e7eb;
                      border-top: 2px solid #9ca3af;
                      border-radius: 50%;
                      animation: spin 1s linear infinite;
                    "></div>
                    Processing...
                  ` : 'Apply Changes'}
                </button>
              ` : ''}
          </div>
        ` : ''}
      </div>
    `;

    // Add CSS animations if not already added
    if (!document.getElementById('toolbar-styles')) {
      const style = document.createElement('style');
      style.id = 'toolbar-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        #injectable-toolbar-container button:hover {
          transform: translateY(-1px);
        }
        #injectable-toolbar-container div::-webkit-scrollbar {
          width: 3px;
        }
        #injectable-toolbar-container div::-webkit-scrollbar-track {
          background: transparent;
        }
        #injectable-toolbar-container div::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
      `;
      document.head.appendChild(style);
    }

    // Add event listeners to buttons
    const toggleBtn = this.container.querySelector('#toggle-btn');
    const clearBtn = this.container.querySelector('#clear-btn');
    const applyBtn = this.container.querySelector('#apply-btn');
    const expandBtn = this.container.querySelector('#expand-btn');
    const removeButtons = this.container.querySelectorAll('[data-remove]');
    const userRequestTextarea = this.container.querySelector('#user-request') as HTMLTextAreaElement;

    toggleBtn?.addEventListener('click', () => this.toggle());
    expandBtn?.addEventListener('click', () => {
      this.isExpanded = !this.isExpanded;
      this.render();
    });
    clearBtn?.addEventListener('click', () => {
      this.selectedElements = [];
      this.userRequest = '';
      this.render();
    });
    applyBtn?.addEventListener('click', () => {
      console.log('🖱️ Apply button clicked, isProcessing:', this.isProcessing);
      if (this.isProcessing) {
        console.log('⚠️ Already processing, ignoring click');
        return;
      }
      this.applyModifications();
    });
    userRequestTextarea?.addEventListener('input', this.handleRequestInput);

    removeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const removeIndex = target.getAttribute('data-remove');
        if (removeIndex !== null) {
          const index = parseInt(removeIndex);
          this.selectedElements.splice(index, 1);
          this.render();
        }
      });
    });

    // Render overlay highlights
    this.overlay.innerHTML = '';

    // Hovered element highlight (only when active and hovering)
    if (this.hoveredElement && this.isActive) {
      const highlight = document.createElement('div');
      highlight.style.cssText = `
        position: absolute;
        border: 2px solid #f59e0b;
        background: rgba(245, 158, 11, 0.1);
        pointer-events: none;
        border-radius: 3px;
        left: ${this.hoveredElement.rect.left - 2}px;
        top: ${this.hoveredElement.rect.top - 2}px;
        width: ${this.hoveredElement.rect.width + 4}px;
        height: ${this.hoveredElement.rect.height + 4}px;
        transition: all 0.1s ease;
      `;

      const tooltip = document.createElement('div');
      tooltip.style.cssText = `
        position: absolute;
        top: -32px;
        left: 0;
        background: #111827;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        white-space: nowrap;
        z-index: 1;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;
      tooltip.textContent = `${this.hoveredElement.metadata.component} (${this.hoveredElement.metadata.file}:${this.hoveredElement.metadata.line})`;
      
      highlight.appendChild(tooltip);
      this.overlay.appendChild(highlight);
    }

    // Selected elements highlights
    this.selectedElements.forEach((selected, index) => {
      const highlight = document.createElement('div');
      highlight.style.cssText = `
        position: absolute;
        border: 2px solid #10b981;
        background: rgba(16, 185, 129, 0.1);
        pointer-events: none;
        border-radius: 3px;
        left: ${selected.rect.left}px;
        top: ${selected.rect.top}px;
        width: ${selected.rect.width}px;
        height: ${selected.rect.height}px;
      `;

      const badge = document.createElement('div');
      badge.style.cssText = `
        position: absolute;
        top: -20px;
        left: -1px;
        background: #10b981;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: 600;
        min-width: 18px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      `;
      badge.textContent = (index + 1).toString();
      
      highlight.appendChild(badge);
      if (this.overlay) {
        this.overlay.appendChild(highlight);
      }
    });
  }
}

// Global initialization function
declare global {
  interface Window {
    InjectableToolbar: typeof InjectableToolbar;
    initInjectableToolbar: (config?: ToolbarConfig) => InjectableToolbar;
  }
}

// Make it globally available
if (typeof window !== 'undefined') {
  window.InjectableToolbar = InjectableToolbar;
  window.initInjectableToolbar = (config?: ToolbarConfig) => {
    const toolbar = new InjectableToolbar(config);
    toolbar.init();
    return toolbar;
  };
}

export { InjectableToolbar, type ToolbarConfig }; 