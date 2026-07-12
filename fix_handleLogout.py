import re

with open('src/components/layout/MainLayout.tsx', 'r') as f:
    content = f.read()

handle_logout_code = """
  const handleLogout = async () => {
       const userStr = localStorage.getItem("user");
       if (userStr) {
           try {
               const parsed = JSON.parse(userStr);
           } catch(e) {}
       }
       try { await supabase.auth.signOut(); } catch(e) {}
       localStorage.removeItem("user");
       navigate("/");
  };
"""

content = re.sub(r"(export default function MainLayout.*?\{\n)", r"\1" + handle_logout_code, content, count=1)

# Replace the inline logout code with handleLogout
content = re.sub(
    r"onClick=\{\(\) => \{\n\s*const userStr = localStorage\.getItem\(\"user\"\);[\s\S]*?navigate\(\"\/\"\);\n\s*\}\}",
    r"onClick={handleLogout}",
    content
)

with open('src/components/layout/MainLayout.tsx', 'w') as f:
    f.write(content)
