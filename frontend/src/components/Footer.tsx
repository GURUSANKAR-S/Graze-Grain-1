const Footer = () => {
  return (
    <footer className="mt-20 border-t border-amber-900/10 bg-gradient-to-r from-[#3e1c0d] via-[#5c2d15] to-[#3e1c0d] py-10 text-amber-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center md:flex-row md:px-6 md:text-left">
        <p className="text-sm opacity-90">&copy; {new Date().getFullYear()} Graze & Grain. All Rights Reserved.</p>
        <p className="text-sm font-semibold tracking-wide text-amber-200">Coimbatore, India</p>
      </div>
    </footer>
  );
};

export default Footer;
