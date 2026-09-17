const Footer = () => {
  return (
    <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
      <p>© 2025 InvoiceApp. All rights reserved.</p>

      <div className="flex justify-center gap-6 mt-3">
        <a href="#" className="hover:text-gray-700">
          Privacy Policy
        </a>

        <a href="#" className="hover:text-gray-700">
          Terms of Service
        </a>

        <a href="#" className="hover:text-gray-700">
          Support
        </a>
      </div>
    </footer>
  );
};

export default Footer;