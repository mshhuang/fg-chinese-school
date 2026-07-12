import os

files = [
    'src/pages/AttendanceSheet.tsx',
    'src/pages/StudentPortal.tsx',
    'src/pages/ParentPortal.tsx'
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Replace the colors
        content = content.replace('bg-[#EFEBE9]', 'bg-[#FFF3E0]')
        content = content.replace('text-[#5D4037]', 'text-[#E65100]')
        content = content.replace('border-[#5D4037]', 'border-[#E65100]')
        content = content.replace('border-[#5D4037]/30', 'border-[#E65100]/30')
        
        with open(file_path, 'w') as f:
            f.write(content)
