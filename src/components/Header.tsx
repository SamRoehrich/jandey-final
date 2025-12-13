export function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="/" className="header-logo">
          Jandey Shaclekford
        </a>
        <nav className="header-nav">
          <a href="/">Home</a>
          <a href="/posts">Posts</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </div>
    </header>
  )
}
