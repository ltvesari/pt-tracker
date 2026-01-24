import urllib.request
import os

urls = [
    ("https://github.com/dejavu-fonts/dejavu-fonts/blob/master/ttf/DejaVuSans.ttf?raw=true", "DejaVuSans.ttf"),
    ("https://raw.githubusercontent.com/dejavu-fonts/dejavu-fonts/master/ttf/DejaVuSans.ttf", "DejaVuSans.ttf"),
    ("https://github.com/google/fonts/raw/main/ofl/roboto/Roboto-Regular.ttf", "Roboto-Regular.ttf")
]

dest_dir = "backend/fonts"
if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

for url, filename in urls:
    dest = os.path.join(dest_dir, filename)
    print(f"Trying to download {url} to {dest}...")
    try:
        urllib.request.urlretrieve(url, dest)
        if os.path.getsize(dest) > 1000: # Verify it's not a small error page
            print(f"Successfully downloaded {filename}.")
            # Rename to standard name if needed or exit
            # If we downloaded Roboto, we might want to standardize
            break
        else:
            print("Downloaded file too small, likely error page.")
            os.remove(dest)
    except Exception as e:
        print(f"Failed: {e}")
