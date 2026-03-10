# Todo App

Just a basic todo list thing I made with Node.js + Express + MongoDB + EJS.  
You sign up, log in, and then you can actually add/edit/complete/delete your own tasks. Nothing crazy, but it works and it's private per user.

## What you can do

- create an account (username + password)
- log in / log out
- add tasks (title + optional longer text)
- edit tasks
- mark them done
- delete them (soft delete — they just get hidden)
- filter: all / pending / completed
- sort: newest → oldest, oldest → newest, or A→Z by title

The UI is super plain but clean. Mobile works okay too.

## Get it running locally (5 minutes)

```bash
git clone <repo-url>
cd todo-app

npm install

# make a .env file
echo "MONGODB_URI=mongodb://localhost:27017/todo" >> .env
echo "SESSION_SECRET=super-secret-thing-change-this" >> .env
# or use MongoDB Atlas connection string

npm run dev
Open http://localhost:3000
(If you use Atlas just paste the srv:// link — works the same.)
Folder overview (only the important bits)

src/config/       → database + logger
src/controllers/  → the actual logic
src/middleware/   → login checks + basic validation
src/models/       → User and Task schemas
src/routes/       → login/signup + tasks routes
views/            → all the EJS pages
public/style.css  → ~100 lines of very basic styling
tests/            → some jest tests (mostly happy path)
logs/             → where winston puts stuff

Quick usage once logged in
You're on /tasks by default.

Big "+ New Task" button to add stuff
Each task has Edit / Complete / Delete buttons
Little filter buttons + sort dropdown at the top

That's basically it.
Security
bcrypt passwords
you can only see/edit/delete your tasks
express-validator on forms
flash messages for errors ("wrong password", "task not found", etc.)

Not Fort Knox, but fine for a learning project / personal use.
Tests?
Yeah, a few.
Bashnpm test
Mostly checking that you can't mess with other people's tasks and that signup/login behave.
Deploy (Render)
Just push to GitHub → connect to Render → add these env vars:

MONGODB_URI
SESSION_SECRET
NODE_ENV=production (optional but nice)

Build: npm install
Start: npm start
Done.
```
