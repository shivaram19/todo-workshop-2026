# Part 6: Testing & Troubleshooting

In this final part, you'll learn how to test your application, debug issues, and explore next steps.

**Time Required:** 30-45 minutes

**What You'll Learn:**
- Manual testing strategies
- Using browser DevTools
- Debugging techniques
- Common issues and solutions
- Next steps for learning

---

## Table of Contents
1. [Manual Testing Checklist](#manual-testing-checklist)
2. [Using Browser DevTools](#using-browser-devtools)
3. [Common Issues](#common-issues)
4. [Debugging Techniques](#debugging-techniques)
5. [Next Steps](#next-steps)

---

## Manual Testing Checklist

Let's systematically test every feature.

### Backend Testing

**1. Server Health**
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"ok","message":"Server is running"}`

**2. Signup**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
Expected: Returns token and user object

**3. Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
Expected: Returns token and user object

**4. Create Todo (Protected)**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test todo"}'
```
Expected: Returns created todo

**5. Get Todos**
```bash
curl http://localhost:3000/api/todos \
  -H "Authorization: Bearer YOUR_TOKEN"
```
Expected: Returns array of todos

**6. Update Todo**
```bash
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"completed":true}'
```
Expected: Returns updated todo

**7. Delete Todo**
```bash
curl -X DELETE http://localhost:3000/api/todos/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
Expected: Returns success message

### Frontend Testing

Open http://localhost:5173 and test:

**Authentication Flow:**
- [ ] Can sign up with valid email and password
- [ ] Can't sign up with invalid email
- [ ] Can't sign up with short password
- [ ] Can't sign up with duplicate email
- [ ] Can login with correct credentials
- [ ] Can't login with wrong password
- [ ] Can toggle between login/signup
- [ ] Authentication persists after page refresh
- [ ] Can logout successfully

**Todo Operations:**
- [ ] Can create new todo
- [ ] Can't create empty todo
- [ ] Can toggle todo completed status
- [ ] Can delete todo
- [ ] Stats update correctly (Total, Completed, Pending)
- [ ] Todos persist after page refresh
- [ ] UI updates immediately (optimistic updates)

**Error Handling:**
- [ ] Network errors show appropriate message
- [ ] Invalid token redirects to login
- [ ] Form validation errors display clearly

**UI/UX:**
- [ ] Loading states show during API calls
- [ ] Buttons disable during loading
- [ ] Error messages are clear and helpful
- [ ] Success feedback is visible
- [ ] Responsive on mobile and desktop

### Database Testing

```bash
# Connect to database
psql -U postgres -d todo_db

# Check users table
SELECT * FROM "User";

# Check todos table
SELECT * FROM "Todo";

# Check relationships
SELECT u.email, COUNT(t.id) as todo_count
FROM "User" u
LEFT JOIN "Todo" t ON u.id = t."userId"
GROUP BY u.id, u.email;

# Exit
\q
```

---

## Using Browser DevTools

Browser DevTools are essential for debugging frontend issues.

### Opening DevTools

**All Browsers:**
- Press `F12`
- Or right-click → Inspect
- Or `Ctrl+Shift+I` (Windows/Linux)
- Or `Cmd+Option+I` (macOS)

### Console Tab

**What it shows:**
- JavaScript errors
- console.log() output
- API errors

**Common console errors:**

**1. Network Error**
```
Failed to fetch
```
Cause: Backend not running
Solution: Start backend server

**2. CORS Error**
```
Access to fetch has been blocked by CORS policy
```
Cause: CORS not configured
Solution: Add `app.use(cors())` in backend

**3. Undefined Error**
```
Cannot read property 'email' of undefined
```
Cause: Trying to access data before it's loaded
Solution: Use optional chaining `user?.email`

### Network Tab

**What it shows:**
- All HTTP requests
- Request/response data
- Status codes
- Timing information

**How to use:**
1. Open Network tab
2. Perform action (login, create todo)
3. Click on request to see details
4. Check:
   - Status code (should be 200, 201, etc.)
   - Request headers (Authorization header present?)
   - Request body (data sent correctly?)
   - Response body (expected data returned?)

**Example: Debugging Login**
1. Click login button
2. See POST request to `/api/auth/login`
3. Click on request
4. **Headers tab**: Check request method and URL
5. **Payload tab**: Verify email and password sent
6. **Response tab**: Check for token and user
7. **Status**: Should be 200

**Red requests mean errors:**
- **401**: Authentication failed
- **403**: Forbidden (no permission)
- **404**: Endpoint not found
- **500**: Server error

### Application Tab

**What it shows:**
- localStorage data
- sessionStorage
- Cookies
- Cache

**Checking localStorage:**
1. Open Application tab
2. Expand "Local Storage"
3. Click on your domain
4. See stored keys:
   - `token`: JWT token
   - `user`: User object (JSON string)

**Testing logout:**
1. Click Logout
2. Check Application tab
3. Verify token and user are removed

**Manual logout (for testing):**
1. Open Application tab
2. Right-click on `token`
3. Delete
4. Refresh page
5. Should redirect to login

### React DevTools (Optional)

Install React DevTools extension:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

**Features:**
- Inspect component hierarchy
- View props and state
- Track re-renders
- Profile performance

---

## Common Issues

### Issue 1: Backend won't start

**Error:**
```
Error: Cannot find module 'express'
```

**Cause:** Dependencies not installed

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: Database connection fails

**Error:**
```
Can't reach database server at localhost:5432
```

**Cause:** PostgreSQL not running

**Solution:**
```bash
# macOS (Homebrew)
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services app

# Verify running
psql -U postgres -c "SELECT version();"
```

### Issue 3: Port already in use

**Error:**
```
EADDRINUSE: address already in use :::3000
```

**Cause:** Another process using port 3000

**Solution:**
```bash
# Find process (macOS/Linux)
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or change port in .env
PORT=3001
```

### Issue 4: Frontend shows blank page

**Cause:** JavaScript error

**Solution:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Common causes:
   - Import path typo
   - Missing dependency
   - Syntax error

### Issue 5: Login doesn't work

**Symptoms:** Click login, nothing happens

**Debug steps:**
1. Open Network tab
2. Check if request is sent
3. If no request: Check frontend code
4. If request fails:
   - Check status code
   - Read error message
   - Verify backend is running

**Common causes:**
- Wrong API URL
- CORS not configured
- Backend not running
- Wrong endpoint path

### Issue 6: Todos don't display

**Cause 1:** Not fetching data

**Solution:** Check useEffect runs:
```javascript
useEffect(() => {
  console.log('Fetching todos...');
  fetchTodos();
}, []);
```

**Cause 2:** Token not sent

**Solution:** Check Authorization header in Network tab

**Cause 3:** Backend filtering wrong user

**Solution:** Check backend middleware sets req.userId correctly

### Issue 7: Token expired

**Error:**
```
Invalid or expired token
```

**Cause:** JWT tokens expire after 24h

**Solution:**
- Login again
- Or increase expiration in backend:
```javascript
jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
  expiresIn: '7d'  // 7 days instead of 24h
});
```

### Issue 8: Password validation fails

**Error:**
```
Password must be at least 6 characters
```

**Cause:** Frontend and backend validation mismatch

**Solution:** Ensure both check same length:

Frontend:
```javascript
if (password.length < 6) {
  setError('Password must be at least 6 characters');
}
```

Backend:
```javascript
if (password.length < 6) {
  return res.status(400).json({ error: 'Password must be at least 6 characters' });
}
```

### Issue 9: Database reset needed

**Symptoms:** Corrupted data, migration errors

**Solution:**
```bash
cd backend

# WARNING: This deletes all data!
npx prisma migrate reset

# When prompted, type 'yes'

# Creates fresh database with latest schema
```

---

## Debugging Techniques

### Console Logging

Add strategic console.logs:

```javascript
// Check if function runs
const fetchTodos = async () => {
  console.log('fetchTodos called');

  if (!token) {
    console.log('No token, returning');
    return;
  }

  try {
    console.log('Making API request...');
    const data = await getTodos(token);
    console.log('Received data:', data);
    setTodos(data);
  } catch (err) {
    console.error('Error:', err);
  }
};
```

### Backend Logging

```javascript
router.post('/todos', authenticateToken, async (req, res) => {
  console.log('Create todo called');
  console.log('User ID:', req.userId);
  console.log('Request body:', req.body);

  try {
    const todo = await prisma.todo.create({
      data: {
        title: req.body.title,
        userId: req.userId,
      },
    });
    console.log('Created todo:', todo);
    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});
```

### React DevTools

**Inspect component state:**
1. Install React DevTools
2. Open DevTools → Components tab
3. Click on component (e.g., TodoList)
4. See current state (todos, loading, error)
5. See props passed to component

### Postman Testing

Use Postman to test backend in isolation:

**Create Collection:**
1. Open Postman
2. Create new collection "Todo App"
3. Add requests:
   - POST Signup
   - POST Login
   - GET Todos
   - POST Create Todo
   - PUT Update Todo
   - DELETE Delete Todo

**Use Variables:**
1. Create environment variable `token`
2. After login, set token:
```javascript
// In Tests tab of login request
pm.environment.set("token", pm.response.json().token);
```
3. Use in other requests:
```
Authorization: Bearer {{token}}
```

### Database Inspection

**Prisma Studio:**
```bash
cd backend
npm run prisma:studio
```

**psql Commands:**
```bash
# Connect
psql -U postgres -d todo_db

# List tables
\dt

# Describe table
\d "User"

# Query data
SELECT * FROM "User";
SELECT * FROM "Todo" WHERE "userId" = 1;

# Count records
SELECT COUNT(*) FROM "Todo";

# Delete all todos (for testing)
DELETE FROM "Todo";

# Exit
\q
```

---

## Next Steps

Congratulations! You've built a complete full-stack application.

### Immediate Improvements

**1. Add Features:**
- Todo categories/tags
- Due dates
- Priority levels
- Search/filter
- Sorting options
- Todo editing (not just title)
- User profile page
- Email verification

**2. Improve Security:**
- Rate limiting
- Input sanitization
- HTTPS in production
- Environment variable validation
- Password strength requirements
- Account lockout after failed attempts

**3. Better UX:**
- Keyboard shortcuts
- Drag-and-drop reordering
- Undo/redo
- Bulk operations
- Export todos
- Dark mode
- Customizable themes

### Learn More

**Frontend:**
- TypeScript for type safety
- React Router for multiple pages
- React Query for server state
- Form libraries (React Hook Form)
- Testing (Jest, React Testing Library)
- Accessibility (ARIA, semantic HTML)

**Backend:**
- Input validation (Zod, Joi)
- API documentation (Swagger)
- Testing (Jest, Supertest)
- Logging (Winston, Morgan)
- Error monitoring (Sentry)
- API versioning

**Database:**
- Database indexes
- Query optimization
- Transactions
- Migrations strategy
- Backup and restore
- Database relationships (many-to-many)

**DevOps:**
- Docker containerization
- CI/CD pipelines
- Cloud deployment (Vercel, Railway, Heroku)
- Environment management
- Monitoring and logging
- Performance optimization

### Deployment

**Frontend (Vercel):**
1. Push code to GitHub
2. Connect to Vercel
3. Configure build settings
4. Add environment variables
5. Deploy!

**Backend (Railway/Heroku):**
1. Push code to GitHub
2. Connect to hosting platform
3. Configure environment variables
4. Add PostgreSQL addon
5. Deploy!

**Database:**
- Use managed PostgreSQL (Railway, AWS RDS, Supabase)
- Run migrations on production
- Set up backups

### Resources

**Documentation:**
- [React Docs](https://react.dev/)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

**Tutorials:**
- [JavaScript.info](https://javascript.info/)
- [React Tutorial](https://react.dev/learn)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

**Practice:**
- Build similar projects with different features
- Contribute to open source
- Join coding communities (Reddit, Discord)
- Code challenges (LeetCode, HackerRank)

---

## Final Checklist

You should now be able to:
- [ ] Build a full-stack application from scratch
- [ ] Set up PostgreSQL database
- [ ] Use Prisma ORM
- [ ] Create RESTful API with Express
- [ ] Implement JWT authentication
- [ ] Build React components
- [ ] Manage state with Context API
- [ ] Make API calls from frontend
- [ ] Debug using DevTools
- [ ] Test the complete application
- [ ] Understand common issues and solutions

---

## Congratulations!

You've completed the full-stack todo application tutorial!

You now have:
- A working full-stack application
- Understanding of backend development
- Frontend development skills
- Database knowledge
- Authentication implementation
- Debugging skills

**Share your project:**
- Push to GitHub
- Deploy to production
- Add to portfolio
- Share on LinkedIn/Twitter

**Keep learning:**
- Build more projects
- Learn advanced topics
- Join developer communities
- Contribute to open source

**Need help?**
- Review documentation files
- Check ARCHITECTURE.md for deep dives
- Use COMMANDS-REFERENCE.md for quick lookups
- Search error messages online

---

## Thank You!

Thank you for following this tutorial. We hope you learned valuable skills that will help in your development journey.

Remember: Every expert was once a beginner. Keep building, keep learning, and don't give up!

Happy coding!
