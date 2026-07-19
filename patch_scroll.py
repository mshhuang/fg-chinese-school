import re
import os

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add id="edit-user-form" to the form container if not present
    content = content.replace('<div className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-sm relative overflow-hidden">',
                              '<div id="edit-user-form" className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/40 shadow-sm relative overflow-hidden">')

    content = content.replace("window.scrollTo({ top: 0, behavior: 'smooth' });",
                              "setTimeout(() => document.getElementById('edit-user-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);")

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/pages/AdminUsers.tsx')
patch_file('src/components/admin/UserDirectoryTab.tsx')
