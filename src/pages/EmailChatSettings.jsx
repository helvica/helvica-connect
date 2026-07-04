import React, { useState } from 'react';
import { Mail, Check, Copy, Code, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmailChatSettings() {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script>
  window.HelvicaChatConfig = {
    workspaceId: "ws_live_demo",
    theme: "light",
    position: "bottom-right",
    greeting: "Hi there! How can we help?"
  };
</script>
<script src="https://widget.helvicaconnect.com/embed.js" async></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-neutral-50 dark:bg-black transition-colors">
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <Link to="/email-chat" className="inline-flex items-center text-sm text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Email Chat
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Email Chat Integration</h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Embed a live email chat widget directly into your website.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 md:p-8 shadow-sm border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
            <Code className="h-5 w-5 mr-2 text-neutral-400" />
            Widget Installation Code
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            Copy the following snippet and paste it just before the closing <code>&lt;/body&gt;</code> tag of your website. This will render the chat bubble on all pages where the script is included.
          </p>

          <div className="relative group rounded-xl overflow-hidden bg-neutral-900 dark:bg-[#1c1c1e] border border-neutral-800">
            <div className="absolute top-0 right-0 p-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors backdrop-blur-md"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-6 text-sm text-neutral-300 font-mono overflow-x-auto">
              <code>{embedCode}</code>
            </pre>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
            <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Need help installing?</h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-400">
              Our widget is compatible with Wordpress, Shopify, Webflow, and custom HTML websites. Send this snippet to your developer if you do not have direct access to your website's codebase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
