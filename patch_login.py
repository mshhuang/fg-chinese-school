import re

with open('src/pages/Login.tsx', 'r') as f:
    content = f.read()

# Remove right side
content = re.sub(
    r'\{\/\* Right Axis: Feature Highlights \*\/\}.*?\{\/\* Passcode Modal for Builder Role \*\/\}',
    '{/* Passcode Modal for Builder Role */}',
    content,
    flags=re.DOTALL
)

# Center the login form
content = content.replace(
    'className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 mx-auto lg:mx-0 shrink-0 overflow-y-auto py-12"',
    'className="w-full flex flex-col justify-center px-8 md:px-16 lg:px-24 mx-auto overflow-y-auto py-12"'
)

with open('src/pages/Login.tsx', 'w') as f:
    f.write(content)
