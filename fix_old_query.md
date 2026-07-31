The old complex join query in `fetchVisibleAnnouncements` was causing the 57014 (query canceled) timeout error because the database took too long to execute it and killed it.

When this error happens, the frontend catches the error and returns an empty array `[]`. As a result, when users view the Announcements page, it will just look completely empty (they will see "No announcements found" or a blank list), even though announcements exist in the database. 

We recently refactored `fetchVisibleAnnouncements` to break down this complex query into multiple smaller, simpler queries to fix this timeout issue permanently. 
