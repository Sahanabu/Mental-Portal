export function Footer() {
  return (
    <footer className="w-full border-t border-white/20 glass mt-auto">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Mentalport. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Contact</span>
        </div>
      </div>
    </footer>
  );
}
