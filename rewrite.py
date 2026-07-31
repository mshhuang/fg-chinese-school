import re

with open('target.txt', 'r') as f:
    content = f.read()

# I will replace the main return with a modified version
# First, insert the `const isExpanded = expandedAnns[ann.announcement_id];`
# And add the toggle chevron

new_content = content.replace(
    'return (\n                     <div \n                        key={ann.announcement_id} \n                        onMouseEnter={() => markAsRead(ann.announcement_id, replies)}\n                        onTouchStart={() => markAsRead(ann.announcement_id, replies)}\n                        onClick={() => markAsRead(ann.announcement_id, replies)}\n                        className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30  flex flex-col hover:shadow-md transition-all shadow-sm"\n                     >',
    '''const isExpanded = expandedAnns[ann.announcement_id];
                  return (
                     <div 
                        key={ann.announcement_id} 
                        className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30  flex flex-col hover:shadow-md transition-all shadow-sm overflow-hidden"
                     >'''
)

# Replace <div className="p-6"> with header and collapse wrapper
# Actually let's just make the top part clickable.
new_content = new_content.replace(
    '<div className="p-6">',
    '''<div className="p-6 cursor-pointer hover:bg-surface-variant/20 transition-colors" onClick={() => toggleAccordion(ann.announcement_id, replies)}>'''
)

# To add the Chevron, I will inject it before the action buttons.
new_content = new_content.replace(
    '''                                 {(user?.role === 'builder' || ann.created_by === user?.id) && (''',
    '''                                 <div className="flex items-center gap-4">
                                     {(user?.role === 'builder' || ann.created_by === user?.id) && ('''
)

# And close the div and add chevron
new_content = new_content.replace(
    '''                                 )}
                             </div>
                             
                             {editingAnnId === ann.announcement_id ? (''',
    '''                                 )}
                                     <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
                                         {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                                     </button>
                                 </div>
                             </div>
                             
                             {isExpanded && (
                               <div onClick={(e) => e.stopPropagation()} className="cursor-auto pt-2">
                             {editingAnnId === ann.announcement_id ? ('''
)

# And wrap the bottom with closing tags
new_content = new_content.replace(
    '''                                 </>
                             )}
                         </div>''',
    '''                                 </>
                             )}
                               </div>
                             )}
                         </div>'''
)

new_content = new_content.replace(
    '''                         {/* Replies Section */}
                         <div className="bg-surface-container-low border-t border-outline-variant/20 px-6 py-4 flex flex-col gap-4">''',
    '''                         {/* Replies Section */}
                         {isExpanded && (
                         <div className="bg-surface-container-low border-t border-outline-variant/20 px-6 py-4 flex flex-col gap-4">'''
)

new_content = new_content.replace(
    '''                                    </div>
                                )}
                          </div>
                      </div>
                  )''',
    '''                                    </div>
                                )}
                          </div>
                         )}
                      </div>
                  )'''
)

with open('target_new.txt', 'w') as f:
    f.write(new_content)
