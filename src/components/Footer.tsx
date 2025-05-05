export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/30 py-6 backdrop-blur-xl">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-400">
          © {new Date().getFullYear()} TweeterLens by{" "}
          <a
            href="https://twitter.com/UtkarshTheDev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            @UtkarshTheDev
          </a>
        </p>
      </div>
    </footer>
  );
}
