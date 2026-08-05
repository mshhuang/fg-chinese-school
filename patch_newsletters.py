with open('src/pages/TeacherNewsletters.tsx', 'r') as f:
    text = f.read()

replacements = [
    ('Title</label>', '{t("Title")}</label>'),
    ('Target Audience</label>', '{t("Target Audience")}</label>'),
    ('Brief Context (Optional)</label>', '{t("Brief Context (Optional)")}</label>'),
    ('Attachments</label>', '{t("Attachments")}</label>'),
    ('Click to attach files</p>', '{t("Click to attach files")}</p>'),
    ('Supported: PDF, Word, Text, Images, HEIC (Max 10MB each)</p>', '{t("Supported: PDF, Word, Text, Images, HEIC (Max 10MB each)")}</p>'),
    ("{isUploading ? 'Saving...' : 'Save as Draft'}", "{isUploading ? t('Saving...') : t('Save as Draft')}"),
    ("{isUploading ? 'Saving...' : 'Submit for Approval'}", "{isUploading ? t('Saving...') : t('Submit for Approval')}"),
]

for old, new in replacements:
    text = text.replace(old, new)

with open('src/pages/TeacherNewsletters.tsx', 'w') as f:
    f.write(text)
