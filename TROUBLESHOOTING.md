# Troubleshooting Guide

## Turbopack Fatal Errors

If you're experiencing Turbopack fatal errors, follow these steps:

### Solution 1: Disable Turbopack (Recommended)
```bash
npm run dev
```
The package.json has been updated to use `--turbo=false` flag.

### Solution 2: Use Alternative Start Script
Run the batch file:
```bash
start-dev.bat
```

### Solution 3: Manual Command
```bash
npx next dev --turbo=false --port=3000
```

### Solution 4: Clear Cache and Restart
```bash
# Delete .next folder
rmdir /s .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Start development server
npm run dev
```

## Common Issues

### 1. GSAP ScrollTrigger Issues
- The app uses a simplified GSAP setup to avoid SSR issues
- ScrollTrigger is loaded dynamically on the client side

### 2. Three.js Performance
- Particle count is optimized for different devices
- 3D scenes are lazy-loaded for better performance

### 3. API Integration
- All API calls have fallback mock data
- Backend is not required for development

### 4. Mobile Responsiveness
- Test on different screen sizes
- Touch interactions are optimized

## Development Tips

### Hot Reload Issues
If hot reload stops working:
1. Save any file to trigger a rebuild
2. Refresh the browser manually
3. Restart the development server

### Build Issues
For production builds:
```bash
npm run build
npm start
```

### Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Browser Compatibility

### Recommended Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### WebGL Support
The 3D features require WebGL support. Most modern browsers support this.

## Performance Optimization

### Development Mode
- Use Chrome DevTools for debugging
- Monitor memory usage for 3D scenes
- Check Network tab for API calls

### Production Mode
- Run `npm run build` to test production build
- Use Lighthouse for performance auditing

## Getting Help

1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure Node.js version is 18+ 
4. Try clearing browser cache
5. Restart the development server

## Known Limitations

- Turbopack is disabled due to compatibility issues
- Some GSAP animations are simplified for stability
- 3D performance may vary on older devices