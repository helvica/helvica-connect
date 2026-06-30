import os
import glob

def replace_in_files():
    files = glob.glob('src/**/*.jsx', recursive=True)
    files.append('src/index.css')
    
    for filepath in files:
        if not os.path.isfile(filepath):
            continue
            
        with open(filepath, 'r') as f:
            content = f.read()
            
        new_content = content.replace('slate', 'neutral')
        
        # We also want to replace bg-neutral-950 with black, and bg-neutral-900 with bg-neutral-900
        new_content = new_content.replace('bg-neutral-950', 'bg-black')
        new_content = new_content.replace('dark:bg-neutral-950', 'dark:bg-black')
        
        if content != new_content:
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Updated {filepath}")

if __name__ == '__main__':
    replace_in_files()
