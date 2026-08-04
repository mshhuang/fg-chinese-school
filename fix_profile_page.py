import re

with open('src/pages/Profile.tsx', 'r') as f:
    content = f.read()

replacements = {
    'My Information': '{t("My Information")}',
    'View and edit your personal details and contact information.': '{t("View and edit your personal details and contact information.")}',
    'Personal Details': '{t("Personal Details")}',
    '>Username<': '>{t("Username")}<',
    'Contact Information': '{t("Contact Information")}',
    'Primary Phone': '{t("Primary Phone")}',
    'Secondary Phone': '{t("Secondary Phone")}',
    'Health & Emergency': '{t("Health & Emergency")}',
    "'None specified'": "t('None specified')",
    "Medical Conditions / Allergies": "{t('Medical Conditions / Allergies')}",
    "Account Security": "{t('Account Security')}",
    "Keep your account secure by updating your password regularly.": "{t('Keep your account secure by updating your password regularly.')}",
    "> Change Password<": "> {t('Change Password')}<"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/pages/Profile.tsx', 'w') as f:
    f.write(content)
print("Updated Profile.tsx")
