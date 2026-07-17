import re

with open('src/main.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import {createRoot} from 'react-dom/client';",
    "import {createRoot} from 'react-dom/client';\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query';\n\nconst queryClient = new QueryClient();"
)

content = content.replace(
    "<ErrorDisplay><App /></ErrorDisplay>",
    "<QueryClientProvider client={queryClient}>\n        <ErrorDisplay><App /></ErrorDisplay>\n      </QueryClientProvider>"
)

with open('src/main.tsx', 'w') as f:
    f.write(content)
print("Patched main.tsx")
