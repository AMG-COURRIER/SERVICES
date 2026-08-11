# AMG Courrier Service

Professional courier & logistics website with live tracking and admin panel.

**Live Site:** https://YOUR-USERNAME.github.io/amg-courrier/

---

## Features

- Modern responsive website (Home, Services, Tracking, About, Contact)
- Live shipment tracking powered by JSONBin
- Full Admin Panel to create, edit, and manage shipments
- Real-time data shared across all browsers
- Mobile-friendly design

---

## Project Structure

```
amg-courrier/
├── index.html
├── services.html
├── tracking.html
├── about.html
├── contact.html
├── admin/
│   ├── index.html          # Admin login & dashboard
│   ├── admin.css
│   └── admin.js
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        ├── jsonbin.js      # JSONBin API connection
        ├── main.js
        └── tracking.js
```

---

## Admin Panel

- URL: `/admin/`
- Default password: `amgadmin2026`

You can change the password in `admin/admin.js`.

---

## How Tracking Works

1. Create or edit shipments in the **Admin Panel**
2. Data is saved to JSONBin
3. Anyone can track the shipment on the public Tracking page using the tracking number

**Sample tracking numbers:**
- `AMG7843921US` → In Transit
- `AMG9921843EX` → Delivered

---

## JSONBin Connection

| Item         | Value |
|--------------|-------|
| Bin ID       | `6a7b51a7da38895dfed69cbf` |
| Access Key   | Used for public reads |
| Master Key   | Used for admin writes |

---

## Local Development

Just open the files in a browser, or use a local server:

```bash
# Python
python -m http.server 8000

# Node
npx serve
```

Then visit: http://localhost:8000

---

## GitHub Pages Setup

1. Create a new **public** repository on GitHub
2. Upload the contents of the `amg-courrier` folder (keep the folder structure)
3. Go to **Settings → Pages**
4. Set Source to `main` branch and `/ (root)`
5. Wait 1–2 minutes — your site will be live

### Force HTTPS
In Settings → Pages, enable **Enforce HTTPS** once it becomes available.

### Custom Domain (optional)
1. Add DNS A records pointing to:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
2. Add a CNAME record for `www` pointing to `YOUR-USERNAME.github.io`
3. Enter your domain in Settings → Pages → Custom domain
4. Enable Enforce HTTPS

---

## Credits

Built for AMG Courrier Service.
