import re

with open('src/pages/Announcements.tsx', 'r') as f:
    content = f.read()

# Replace the end of the replies section with the closing tag
content = content.replace(
    '''                                    </div>
                                )}
                          </div>
                      </div>
                  )
              })}''',
    '''                                    </div>
                                )}
                          </div>
                         )}
                      </div>
                  )
              })}'''
)

with open('src/pages/Announcements.tsx', 'w') as f:
    f.write(content)
