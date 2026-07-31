import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '''                                        <h3 className="text-2xl font-bold text-on-surface hover:underline cursor-pointer flex items-center gap-2">
                                           {authorName}''',
    '''                                        <h3 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                                           {ann.title ? ann.title : authorName}'''
)

content = content.replace(
    '''                                        </h3>
                                        
                                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                                           {new Date(ann.created_at || Date.now()).toLocaleDateString('en-US', { timeZone: 'America/New_York' })} • 
                                           <Users className="w-3 h-3 inline ml-1 mr-0.5"/> To: {audienceInfo}''',
    '''                                        </h3>
                                        
                                        <p className="text-sm text-on-surface-variant font-medium mt-1">
                                           {ann.title ? <span className="font-bold mr-2 text-on-surface">{authorName}</span> : null}
                                           {new Date(ann.created_at || Date.now()).toLocaleDateString('en-US', { timeZone: 'America/New_York' })} • 
                                           <Users className="w-3 h-3 inline ml-1 mr-0.5"/> To: {audienceInfo}'''
)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
