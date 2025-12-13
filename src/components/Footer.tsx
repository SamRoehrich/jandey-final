export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>&copy; {year} Jandey Shaclekford. All rights reserved.</p>
      </div>
    </footer>
  )
}
