import re

with open('src/components/layout/MainLayout.tsx', 'r') as f:
    content = f.read()

# First remove the handle_logout_code
content = re.sub(r"  const handleLogout = async \(\) => \{[\s\S]*?  \};\n", "", content)

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

content = re.sub(r"(const navigate = useNavigate\(\);\n)", r"\1" + handle_logout_code, content, count=1)

with open('src/components/layout/MainLayout.tsx', 'w') as f:
    f.write(content)
