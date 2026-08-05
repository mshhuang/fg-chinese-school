import re

with open('src/pages/BuilderDatabase.tsx', 'r') as f:
    text = f.read()

calc_code = """
  const totalEgress = egressChartData.reduce((acc, curr) => acc + (parseFloat(curr.egress) || 0), 0);
  const overage = Math.max(0, totalEgress - 5);
"""

text = text.replace('  const [clearingTable, setClearingTable] = useState<string | null>(null);', '  const [clearingTable, setClearingTable] = useState<string | null>(null);\n' + calc_code)

text = text.replace('<span className="text-sm font-mono text-on-surface">12.81 GB</span>', '<span className="text-sm font-mono text-on-surface">{totalEgress.toFixed(2)} GB</span>')
text = text.replace('<span className="text-sm font-mono text-on-surface">7.81 GB</span>', '<span className="text-sm font-mono text-on-surface">{overage.toFixed(2)} GB</span>')

with open('src/pages/BuilderDatabase.tsx', 'w') as f:
    f.write(text)
