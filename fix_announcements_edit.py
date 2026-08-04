import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

state_vars = """
  const [editAudienceMode, setEditAudienceMode] = useState("all");
  const [editTargetRoleIds, setEditTargetRoleIds] = useState<string[]>([]);
  const [editTargetClassIds, setEditTargetClassIds] = useState<string[]>([]);
  const [editTargetUserIds, setEditTargetUserIds] = useState<string[]>([]);
  const [editUserSearchQuery, setEditUserSearchQuery] = useState("");
"""

content = content.replace(
    'const [editAnnContentStr, setEditAnnContentStr] = useState("");',
    'const [editAnnContentStr, setEditAnnContentStr] = useState("");' + state_vars
)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
