import os

# Read the corrupted file
with open('backend/academics/views.py', 'rb') as f:
    content = f.read()

# Find the end of the valid content (before the garbage appended by PowerShell)
# The last valid line was '        return Response(events)' which is line 1062.
# We look for that byte sequence. 
# Or we just take the first 1062 lines if strictly line based, but binary read is safer.
# Let's count lines.
lines = content.splitlines(keepends=True)
clean_lines = lines[:1062]

# Read the attendance views
with open('backend/academics/attendance_views.py', 'rb') as f:
    attendance_code = f.read()

# Write back
with open('backend/academics/views.py', 'wb') as f:
    f.writelines(clean_lines)
    f.write(b'\n\n')
    f.write(attendance_code)

print("Fixed views.py")
