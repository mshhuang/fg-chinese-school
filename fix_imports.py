import re

for filepath in ['src/pages/TeacherNewsletters.tsx', 'src/pages/PrincipalNewsletters.tsx']:
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix the messed up import
    content = content.replace('} from "ArrowLeft } from "lucide-react";', ', ArrowLeft } from "lucide-react";')
    content = content.replace('} from "ArrowLeft, lucide-react";', ', ArrowLeft } from "lucide-react";')
    
    with open(filepath, 'w') as f:
        f.write(content)

