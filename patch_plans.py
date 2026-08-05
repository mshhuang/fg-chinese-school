with open('src/pages/MyLessonPlans.tsx', 'r') as f:
    text = f.read()

replacement = """                      <p className="font-bold font-display text-primary mb-3 text-base flex items-center gap-2"><Sparkles className="w-4 h-4" /> {t("Sharing Instructions")}</p>
                      <ol className="list-decimal pl-5 space-y-2 font-body text-on-surface-variant">
                        <li>{t("Open your Google Doc or Slide.")}</li>
                        <li dangerouslySetInnerHTML={{ __html: t("step_2") }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t("step_3") }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t("step_4") }}></li>
                        <li dangerouslySetInnerHTML={{ __html: t("step_5") }}></li>
                      </ol>"""

text = text.replace("""                      <p className="font-bold font-display text-primary mb-3 text-base flex items-center gap-2"><Sparkles className="w-4 h-4" /> Sharing Instructions</p>
                      <ol className="list-decimal pl-5 space-y-2 font-body text-on-surface-variant">
                        <li>Open your Google Doc or Slide.</li>
                        <li>Click the blue <strong>Share</strong> button in the top right.</li>
                        <li>Under "General access", change Restricted to <strong>Anyone with the link</strong>.</li>
                        <li>Ensure the role on the right is set to <strong>Viewer</strong>.</li>
                        <li>Click <strong>Copy link</strong> and paste it into the field below.</li>
                      </ol>""", replacement)

with open('src/pages/MyLessonPlans.tsx', 'w') as f:
    f.write(text)
