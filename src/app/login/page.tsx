import styles from '../../../Login.module.css';

export default function Login() {
  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        {/* Left Section */}
        <div className={styles.welcomeSection}>
          <div className={styles.logo}>
            <h1>LOGO</h1>
          </div>
          <h2>Welcome Page</h2>
          <p>Sign in to continue access</p>
          <a href="#" className={styles.websiteLink}>www.yoursite.com</a>
        </div>

        {/* Right Section */}
        <div className={styles.formSection}>
          <h2 className={styles.signInTitle}>Sign In</h2>
          <form className={styles.loginForm}>
            <input
              type="email"
              placeholder="Email Address"
              className={styles.inputField}
            />
            <input
              type="password"
              placeholder="Password"
              className={styles.inputField}
            />
            <button type="submit" className={styles.continueButton}>
              CONTINUE
            </button>
          </form>
          <p className={styles.orText}>or Connect with Social Media</p>
          <div className={styles.socialButtons}>
            <button className={`${styles.socialButton} ${styles.twitter}`}>
              Sign In With Twitter
            </button>
            <button className={`${styles.socialButton} ${styles.facebook}`}>
              Sign In With Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}