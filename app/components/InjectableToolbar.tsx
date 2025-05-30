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
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
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

  constructor(config: ToolbarConfig = {}) {
    this.config = {
      position: 'top-right',
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
      'bottom-left': 'bottom: 16px; left: 16px;'
    };
    return positions[this.config.position || 'top-right'];
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
    if (!this.isActive) return;

    const element = this.getElementAtPoint(event.clientX, event.clientY);
    if (!element) {
      this.hoveredElement = null;
      this.render();
      return;
    }

    const metadata = this.parseElementMetadata(element);
    if (!metadata) return;

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
        let successMessage = '✅ Claude Code execution completed successfully';
        
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
        const errorMessage = `❌ Claude Code execution failed: ${result.error || 'Unknown error'}`;
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
      this.showNotification('❌ Failed to execute Claude Code - Check console for details');
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
      background: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      z-index: 1000000;
      font-family: inherit;
      font-size: 14px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  private render(): void {
    if (!this.container || !this.overlay) return;

    console.log('🎨 Rendering toolbar, isProcessing:', this.isProcessing, 'selectedElements:', this.selectedElements.length);

    // Render toolbar UI
    this.container.innerHTML = `
      <div style="
        background: ${this.config.theme === 'dark' ? '#1f2937' : 'white'};
        color: ${this.config.theme === 'dark' ? 'white' : '#1f2937'};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border: 1px solid ${this.config.theme === 'dark' ? '#374151' : '#e5e7eb'};
        padding: 16px;
        min-width: 280px;
        max-width: 320px;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h3 style="margin: 0; font-weight: 600; font-size: 16px;">Element Detector</h3>
          <button id="toggle-btn" style="
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            background: ${this.isActive ? '#3b82f6' : '#6b7280'};
            color: white;
          ">
            ${this.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>

        ${this.isActive ? `
          <div style="
            background: ${this.config.theme === 'dark' ? '#1e40af' : '#dbeafe'};
            color: ${this.config.theme === 'dark' ? '#bfdbfe' : '#1e40af'};
            padding: 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-bottom: 12px;
          ">
            🎯 <strong>Detection active!</strong><br>
            • Hover to highlight<br>
            • Click to select<br>
            • ESC to clear
          </div>
        ` : ''}

        ${this.hoveredElement ? `
          <div style="
            background: ${this.config.theme === 'dark' ? '#1e3a8a' : '#dbeafe'};
            color: ${this.config.theme === 'dark' ? '#bfdbfe' : '#1e40af'};
            padding: 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-bottom: 12px;
          ">
            <strong>Hovering:</strong><br>
            ${this.hoveredElement.metadata.component} (${this.hoveredElement.metadata.file}:${this.hoveredElement.metadata.line})
          </div>
        ` : ''}

        ${this.selectedElements.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 500; font-size: 14px;">Selected (${this.selectedElements.length}):</span>
              <button id="clear-btn" style="
                background: none;
                border: none;
                color: #dc2626;
                font-size: 12px;
                cursor: pointer;
              ">Clear all</button>
            </div>
            <div style="max-height: 120px; overflow-y: auto; margin-bottom: 12px;">
              ${this.selectedElements.map((sel, index) => `
                <div style="
                  background: ${this.config.theme === 'dark' ? '#065f46' : '#d1fae5'};
                  color: ${this.config.theme === 'dark' ? '#a7f3d0' : '#065f46'};
                  padding: 6px;
                  border-radius: 4px;
                  font-size: 11px;
                  margin-bottom: 4px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                ">
                  <div>
                    <strong>${index + 1}. ${sel.metadata.component}</strong><br>
                    ${sel.metadata.file}:${sel.metadata.line}
                  </div>
                  <button data-remove="${index}" style="
                    background: none;
                    border: none;
                    color: #dc2626;
                    cursor: pointer;
                    font-size: 14px;
                  ">×</button>
                </div>
              `).join('')}
            </div>

            <div style="margin-bottom: 12px;">
              <label style="
                display: block;
                font-weight: 500;
                font-size: 12px;
                margin-bottom: 4px;
                color: ${this.config.theme === 'dark' ? '#d1d5db' : '#374151'};
              ">What would you like to change?</label>
              <textarea id="user-request" placeholder="e.g., Change the button color to blue, add a border, make it larger..." style="
                width: 100%;
                min-height: 60px;
                padding: 8px;
                border: 1px solid ${this.config.theme === 'dark' ? '#4b5563' : '#d1d5db'};
                border-radius: 4px;
                font-size: 12px;
                font-family: inherit;
                background: ${this.config.theme === 'dark' ? '#1f2937' : 'white'};
                color: ${this.config.theme === 'dark' ? 'white' : '#1f2937'};
                resize: vertical;
                box-sizing: border-box;
              ">${this.userRequest}</textarea>
            </div>

            <button id="apply-btn" style="
              width: 100%;
              padding: 10px;
              background: ${this.isProcessing ? '#6b7280' : '#3b82f6'};
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
              cursor: ${this.isProcessing ? 'not-allowed' : 'pointer'};
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            " ${this.isProcessing ? 'disabled' : ''}>
              ${this.isProcessing ? '⏳ Applying Changes...' : '🚀 Apply Changes'}
            </button>
          </div>
        ` : ''}

        <div style="
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid ${this.config.theme === 'dark' ? '#374151' : '#e5e7eb'};
          font-size: 11px;
          color: ${this.config.theme === 'dark' ? '#9ca3af' : '#6b7280'};
        ">
          Tagged elements: ${document.querySelectorAll('[data-pm-edit]').length}
        </div>
      </div>
    `;

    // Add event listeners to buttons
    const toggleBtn = this.container.querySelector('#toggle-btn');
    const clearBtn = this.container.querySelector('#clear-btn');
    const applyBtn = this.container.querySelector('#apply-btn');
    const removeButtons = this.container.querySelectorAll('[data-remove]');
    const userRequestTextarea = this.container.querySelector('#user-request') as HTMLTextAreaElement;

    toggleBtn?.addEventListener('click', () => this.toggle());
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

    // Hovered element highlight
    if (this.hoveredElement && this.isActive) {
      const highlight = document.createElement('div');
      highlight.style.cssText = `
        position: absolute;
        border: 2px solid #3b82f6;
        background: rgba(59, 130, 246, 0.1);
        pointer-events: none;
        border-radius: 4px;
        left: ${this.hoveredElement.rect.left - 2}px;
        top: ${this.hoveredElement.rect.top - 2}px;
        width: ${this.hoveredElement.rect.width + 4}px;
        height: ${this.hoveredElement.rect.height + 4}px;
      `;

      const tooltip = document.createElement('div');
      tooltip.style.cssText = `
        position: absolute;
        top: -32px;
        left: 0;
        background: #1f2937;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        white-space: nowrap;
        z-index: 1;
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
        border-radius: 4px;
        left: ${selected.rect.left}px;
        top: ${selected.rect.top}px;
        width: ${selected.rect.width}px;
        height: ${selected.rect.height}px;
      `;

      const badge = document.createElement('div');
      badge.style.cssText = `
        position: absolute;
        top: -24px;
        left: -1px;
        background: #10b981;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        min-width: 20px;
        text-align: center;
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