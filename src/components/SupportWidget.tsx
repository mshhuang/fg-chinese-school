import { toJpeg } from 'html-to-image';
import React, { useState } from 'react';
import { MessageSquare, X, Camera, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';


const BUILDER_USER_ID = 'ec13df7f-1a4f-422e-abd8-05732ca798d2';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTakeScreenshot = async () => {
    setIsTakingScreenshot(true);
    
    const widgetEl = document.getElementById('support-widget');
    const modalEl = document.getElementById('support-modal');
    const originalWidgetDisplay = widgetEl ? widgetEl.style.display : '';
    const originalModalDisplay = modalEl ? modalEl.style.display : '';
    
    if (widgetEl) widgetEl.style.display = 'none';
    if (modalEl) modalEl.style.display = 'none';

    let scrollContainer: HTMLElement | null = null;
    let innerContent: HTMLElement | null = null;
    let originalMarginTop = '';
    let originalScrollTop = 0;

    // Temporarily remove stylesheets that cause DOMException
    const badStyles: Element[] = [];
    const badParents: (ParentNode | null)[] = [];
    const badSiblings: (ChildNode | null)[] = [];

    try {
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          // Accessing cssRules on a cross-origin stylesheet will throw a DOMException
          const rules = document.styleSheets[i].cssRules;
        } catch (e) {
          const owner = document.styleSheets[i].ownerNode;
          if (owner) {
            badStyles.push(owner as Element);
            badParents.push(owner.parentNode);
            badSiblings.push(owner.nextSibling);
          }
        }
      }
      
      badStyles.forEach(node => node.remove());

      scrollContainer = document.getElementById('main-scroll-container');
      innerContent = document.getElementById('main-scroll-inner');
      
      if (scrollContainer && innerContent && scrollContainer.scrollTop > 0) {
        originalScrollTop = scrollContainer.scrollTop;
        originalMarginTop = innerContent.style.marginTop;
        
        innerContent.style.marginTop = `calc(${originalMarginTop || '0px'} - ${originalScrollTop}px)`;
        scrollContainer.scrollTop = 0;
      }
      
      // Allow DOM to update
      await new Promise(resolve => setTimeout(resolve, 150));

      
      const dataUrl = await toJpeg(document.body, {
        quality: 0.5,
        filter: (node) => {
          if (node.tagName === 'LINK') {
            const href = (node as HTMLLinkElement).href;
            if (href && !href.startsWith(window.location.origin) && !href.startsWith('/')) {
              return false; // exclude remote stylesheets which crash cssRules
            }
          }
          return true;
        }
      });
      
      setScreenshotData(dataUrl);
    } catch (err) {
      console.error('Failed to take screenshot', err);
      alert('Could not capture screenshot. You can still submit the issue without it.');
    } finally {
      if (widgetEl) widgetEl.style.display = originalWidgetDisplay;
      if (modalEl) modalEl.style.display = originalModalDisplay;
      
      if (scrollContainer && innerContent && originalScrollTop > 0) {
        innerContent.style.marginTop = originalMarginTop;
        scrollContainer.scrollTop = originalScrollTop;
      }

      // Restore bad stylesheets
      badStyles.forEach((node, i) => {
        if (badParents[i]) {
          badParents[i]?.insertBefore(node, badSiblings[i]);
        }
      });
      
      setIsTakingScreenshot(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      let userStr = localStorage.getItem('user');
      let userId = null;
      let userName = 'Anonymous User';
      
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          userId = u.id;
          userName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || userName;
        } catch(e) {}
      }

      
      // Also notify builder via internal messages
      let messageBody = `**Issue Report from ${userName}**\n\n**Page:** ${window.location.pathname}\n\n**Description:**\n${description}`;
      if (screenshotData) {
        messageBody += `\n\n*(A screenshot was captured. You can view it in the Support Tickets dashboard).*`;
      }

      await supabase.from('internal_messages').insert({
        sender_id: userId || BUILDER_USER_ID, // fallback to builder if anonymous so it doesn't fail foreign key
        recipient_id: BUILDER_USER_ID,
        subject: `[Support Ticket] Issue on ${window.location.pathname}`,
        body: messageBody,
        read_at: null
      });

      // Insert into error_logs as well so it shows on the Support Tickets dashboard page
      await supabase.from('error_logs').insert({
        type: 'support_ticket',
        message: `Feedback/Issue Report from ${userName}`,
        path: window.location.pathname,
        details: {
          description: description,
          screenshot: screenshotData
        }
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setDescription('');
        setScreenshotData(null);
      }, 3000);
      
    } catch (err) {
      console.error('Failed to submit report', err);
      alert("There was an error submitting your report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div id="support-widget" className="fixed bottom-6 right-6 z-[9999] group flex items-center justify-end">
        <div className="absolute right-full mr-4 bg-surface-container-highest text-on-surface text-xs font-label font-bold px-3 py-2 rounded-xl shadow-md border border-outline-variant/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 whitespace-nowrap hidden sm:block">
           Report an issue
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-on-primary p-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center relative"
          title="Report an Issue"
        >
          <MessageSquare className="w-6 h-6 hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div id="support-modal" className="fixed inset-0 z-[10000] bg-scrim/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-highest rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-on-surface">Report an Issue</h2>
                <p className="text-sm font-body text-on-surface-variant">Describe the problem you are experiencing so we can investigate.</p>
              </div>
            </div>

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-display font-bold text-on-surface mb-2">Report Successfully Submitted!</h3>
                <p className="text-on-surface-variant">Thank you for letting us know. We have received your report and our team will look into it shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  <label htmlFor="description" className="text-sm font-label font-bold text-on-surface">What happened?</label>
                  <textarea
                    id="description"
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the issue you are experiencing..."
                    className="w-full bg-surface p-4 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[120px] text-on-surface font-body"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-label font-bold text-on-surface">Screenshot (Optional)</label>
                  
                  {screenshotData ? (
                    <div className="relative rounded-xl border border-outline-variant/30 overflow-hidden bg-surface-variant/30">
                      <img src={screenshotData} alt="Screenshot preview" className="w-full object-contain max-h-[200px]" />
                      <button 
                        type="button" 
                        onClick={() => setScreenshotData(null)}
                        className="absolute top-2 right-2 p-1.5 bg-error/90 text-on-error hover:bg-error rounded-full shadow-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleTakeScreenshot}
                      disabled={isTakingScreenshot}
                      className="w-full py-3 border-2 border-dashed border-outline-variant/50 hover:border-primary/50 hover:bg-primary/5 rounded-xl flex items-center justify-center gap-2 text-primary font-label transition-colors disabled:opacity-50"
                    >
                      {isTakingScreenshot ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Capturing...</>
                      ) : (
                        <><Camera className="w-4 h-4" /> Take Screenshot of Current Page</>
                      )}
                    </button>
                  )}
                  <p className="text-xs text-on-surface-variant px-1 mt-1">This will capture the current screen to help us diagnose the issue.</p>
                </div>

                <div className="mt-4 pt-4 border-t border-outline-variant/30">
                  <button
                    type="submit"
                    disabled={isSubmitting || !description.trim()}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-label font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-5 h-5" /> Submit Report</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
