import os
import sys
from PIL import Image

src_image_path = r"C:\Users\hephz\.gemini\antigravity\brain\010461ab-6587-409a-bebc-06f5b5ea6956\ogere_app_logo_1789496154134.jpg"

if not os.path.exists(src_image_path):
    print(f"Error: Source image not found at {src_image_path}")
    sys.exit(1)

img = Image.open(src_image_path).convert("RGBA")
print(f"Loaded source image: {img.size}")

# 1. Update mobile/assets
os.makedirs("mobile/assets", exist_ok=True)
img.resize((1024, 1024), Image.Resampling.LANCZOS).save("mobile/assets/icon.png", "PNG")
img.resize((1024, 1024), Image.Resampling.LANCZOS).save("mobile/assets/adaptive-icon.png", "PNG")
img.resize((48, 48), Image.Resampling.LANCZOS).save("mobile/assets/favicon.png", "PNG")

# Splash image: 2048x2048 with emerald green background #064e3b
splash = Image.new("RGBA", (2048, 2048), (6, 78, 59, 255))
logo_splash = img.resize((1024, 1024), Image.Resampling.LANCZOS)
splash.paste(logo_splash, (512, 512), logo_splash)
splash.save("mobile/assets/splash.png", "PNG")
print("Updated mobile/assets icons and splash.")

# 2. Update Android mipmaps
android_res = "mobile/android/app/src/main/res"
if os.path.exists(android_res):
    density_sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    for folder, size in density_sizes.items():
        folder_path = os.path.join(android_res, folder)
        os.makedirs(folder_path, exist_ok=True)
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        resized.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
        resized.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")
        print(f"Updated {folder} ({size}x{size})")

    splash_sizes = {
        "drawable-mdpi": (320, 480),
        "drawable-hdpi": (480, 800),
        "drawable-xhdpi": (720, 1280),
        "drawable-xxhdpi": (960, 1600),
        "drawable-xxxhdpi": (1280, 1920),
    }
    for folder, (w, h) in splash_sizes.items():
        folder_path = os.path.join(android_res, folder)
        os.makedirs(folder_path, exist_ok=True)
        d_splash = Image.new("RGBA", (w, h), (6, 78, 59, 255))
        icon_dim = min(int(w * 0.5), int(h * 0.5))
        s_icon = img.resize((icon_dim, icon_dim), Image.Resampling.LANCZOS)
        d_splash.paste(s_icon, ((w - icon_dim) // 2, (h - icon_dim) // 2), s_icon)
        d_splash.save(os.path.join(folder_path, "splashscreen_image.png"), "PNG")
        print(f"Updated {folder} splash ({w}x{h})")

# 3. Update web public assets
os.makedirs("public", exist_ok=True)
img.resize((192, 192), Image.Resampling.LANCZOS).save("public/favicon.png", "PNG")
img.resize((512, 512), Image.Resampling.LANCZOS).save("public/logo.png", "PNG")
print("Updated public/favicon.png and public/logo.png")

print("All app icons and assets updated successfully!")
