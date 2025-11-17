# Legal Compliance Checklist for Journal Safe

**Last Updated:** November 17, 2025
**Status:** Pre-Production Review Required
**Version:** 1.0

---

## ⚠️ CRITICAL DISCLAIMER

**This checklist is a template and does NOT constitute legal advice.**

**BEFORE LAUNCHING JOURNAL SAFE IN PRODUCTION:**
- [ ] **Consult with a qualified attorney** licensed in your jurisdiction
- [ ] **Review all legal documents** (Privacy Policy, Terms of Service)
- [ ] **Ensure compliance** with all applicable laws and regulations
- [ ] **Obtain professional legal review** of all templates and implementations

**Laws vary by jurisdiction and change frequently. This checklist is provided for informational purposes only.**

---

## Document Status

| Document | Status | Location | Last Review |
|----------|--------|----------|-------------|
| Privacy Policy | ✅ Template Created | `/docs/PRIVACY_POLICY.md` | 2025-11-17 |
| Terms of Service | ✅ Template Created | `/docs/TERMS_OF_SERVICE.md` | 2025-11-17 |
| Privacy Policy Screen | ✅ Implemented | `/app/privacy.tsx` | 2025-11-17 |
| Terms of Service Screen | ✅ Implemented | `/app/terms.tsx` | 2025-11-17 |
| Onboarding Acceptance | ✅ Implemented | `/app/onboarding/index.tsx` | 2025-11-17 |
| Legal Compliance Checklist | ✅ Created | `/docs/LEGAL_COMPLIANCE.md` | 2025-11-17 |

---

## Pre-Launch Legal Checklist

### 1. Company Formation & Registration

- [ ] **Company registered** (LLC, Corporation, etc.)
- [ ] **EIN obtained** from IRS
- [ ] **State business registration** completed
- [ ] **Business address established** (for legal notices)
- [ ] **Registered agent** designated (if required)
- [ ] **Business bank account** opened
- [ ] **Business insurance** obtained (general liability, E&O, cyber liability)

**Notes:**
- Update Privacy Policy and Terms with actual company information
- Update contact addresses in all legal documents

---

### 2. Privacy Policy Requirements

#### General Compliance
- [x] Privacy Policy created
- [x] Privacy Policy accessible in-app (`/privacy`)
- [x] Privacy Policy accessible from Settings
- [x] Last updated date included
- [ ] **Attorney review completed**
- [ ] Actual company contact information added
- [ ] Privacy email address configured (`privacy@journalsafe.com`)

#### Content Requirements
- [x] What data is collected (clearly disclosed)
- [x] Why data is collected (purposes explained)
- [x] How data is used (all uses disclosed)
- [x] How data is stored (Supabase/AWS disclosed)
- [x] Data retention policies (30 days + 90 day backups)
- [x] Security measures (encryption, access controls)
- [x] Third-party service providers (Supabase disclosed)
- [x] No data sale policy (clearly stated)
- [x] User rights (access, export, delete, opt-out)
- [x] Children's privacy (COPPA - under 13 prohibited)
- [x] International data transfers (US storage disclosed)
- [x] Contact information (email addresses listed)
- [x] Changes notification process (30 days notice)

#### Privacy Law Compliance

**GDPR (European Union) - IF you have EU users:**
- [x] GDPR rights disclosed (access, rectification, erasure, portability, object)
- [x] Legal basis for processing disclosed (consent, contract, legitimate interest)
- [x] Data transfer mechanism disclosed (Standard Contractual Clauses)
- [ ] **EU Representative appointed** (required if applicable under Art. 27)
- [ ] **Data Protection Officer appointed** (if required)
- [ ] **Data Processing Agreements** with Supabase (confirm they have one)
- [ ] **Cookie consent mechanism** (if using cookies/trackers - currently N/A)
- [ ] **Privacy by Design implemented** (data minimization, etc.)
- [ ] **Breach notification process** (72 hours to supervisory authority)

**CCPA/CPRA (California):**
- [x] Categories of personal information disclosed
- [x] Right to know disclosed
- [x] Right to delete disclosed
- [x] Right to correct disclosed
- [x] "Do Not Sell" statement (we don't sell data)
- [x] No discrimination statement
- [ ] **"Do Not Sell My Personal Information" link** (if applicable - we don't sell, so may not need)
- [ ] **Authorized agent process** documented
- [ ] **Verification process** for requests documented
- [ ] **Response timeline** (45 days) documented

**COPPA (Children's Privacy):**
- [x] Age restriction (13+) clearly stated
- [x] No collection from children under 13
- [x] Parent notification process if child data discovered
- [x] Immediate deletion process for child data
- [ ] **Age verification mechanism** (currently honor system - consider enhancing)

**Other State Privacy Laws (Virginia, Colorado, Connecticut, Utah, etc.):**
- [x] Similar rights as CCPA (access, delete, correct, opt-out)
- [ ] **Review specific state requirements** if you have users in these states

---

### 3. Terms of Service Requirements

#### General Compliance
- [x] Terms of Service created
- [x] Terms of Service accessible in-app (`/terms`)
- [x] Terms of Service accessible from Settings
- [x] Last updated date included
- [x] Acceptance mechanism in onboarding
- [ ] **Attorney review completed**
- [ ] Actual company contact information added
- [ ] Legal email address configured (`legal@journalsafe.com`)

#### Content Requirements
- [x] Acceptance of terms (clear agreement mechanism)
- [x] Eligibility (age 13+, capacity to contract)
- [x] Account registration and security
- [x] User responsibilities
- [x] Prohibited uses
- [x] Content ownership (user owns content, limited license to us)
- [x] Medical disclaimer (NOT medical advice, NOT treatment)
- [x] Crisis disclaimer (call 911/988, not for emergencies)
- [x] Disclaimers ("AS IS", no warranties)
- [x] Limitation of liability
- [x] Indemnification
- [x] Termination (user and company rights)
- [x] Governing law (UPDATE with actual state/jurisdiction)
- [x] Dispute resolution (informal resolution, arbitration optional)
- [x] Changes to terms (30 days notice)
- [x] Contact information

#### Legal Provisions to Review with Attorney

**Governing Law & Jurisdiction:**
- [ ] **Specify governing state law** (e.g., Delaware, California)
- [ ] **Specify venue for disputes** (e.g., county/state courts)
- [ ] **Review choice of law clause** with attorney
- [ ] **Consider international users** (different laws may apply)

**Arbitration Clause:**
- [ ] **Decide if you want arbitration** (consult attorney - pros/cons)
- [ ] **If yes: Ensure fairness** (AAA rules, cost-sharing, opt-out provision)
- [ ] **Class action waiver** (may not be enforceable everywhere)
- [ ] **Carve-outs** (small claims, injunctive relief)

**Limitation of Liability:**
- [ ] **Ensure enforceability** in your jurisdiction
- [ ] **Understand exceptions** (some states don't allow certain exclusions)
- [ ] **Consider liability cap** (currently $0 for free users, review for paid)

**Indemnification:**
- [ ] **Review scope** (is it too broad or too narrow?)
- [ ] **Mutual indemnification** (consider if appropriate)

---

### 4. App Store Compliance

#### Apple App Store (iOS)
- [ ] **App Store Connect account created**
- [ ] **Apple Developer Program membership** ($99/year)
- [ ] **Privacy Nutrition Labels configured** in App Store Connect
  - [ ] Data Used to Track You: None (unless you add analytics)
  - [ ] Data Linked to You: Email, Name, User Content, Photos
  - [ ] Data Not Linked to You: Crash Data, Performance Data
- [ ] **Privacy Policy URL provided** in App Store listing
- [ ] **Terms of Service URL provided** (optional but recommended)
- [ ] **Age rating configured** (13+ minimum)
- [ ] **Health disclaimer in app description** (not medical advice)
- [ ] **App Store Review Guidelines compliance:**
  - [ ] 1.4.4 Overly sexual or pornographic (N/A - wellness app)
  - [ ] 2.1 App Completeness (ensure fully functional)
  - [ ] 2.3.8 Metadata (accurate description, no misleading claims)
  - [ ] 4.8 Sign in with Apple (if offering third-party login)
  - [ ] 5.1 Privacy (privacy policy, data handling)

#### Google Play Store (Android)
- [ ] **Google Play Console account created**
- [ ] **Google Play Developer registration** ($25 one-time)
- [ ] **Data Safety section completed** in Play Console
  - [ ] Data collection: Email, Name, User Content, Photos
  - [ ] Data usage: App functionality, Account management
  - [ ] Data sharing: None (no third parties)
  - [ ] Data security: Encryption in transit, Encryption at rest
  - [ ] Data deletion: User can request deletion
- [ ] **Privacy Policy URL provided** in Play Store listing
- [ ] **Age rating configured** (Teen 13+ or Everyone)
- [ ] **Health disclaimer in app description**
- [ ] **Google Play Policy compliance:**
  - [ ] User Data (collect transparently, secure, give control)
  - [ ] Permissions (request only necessary permissions)
  - [ ] Deceptive Behavior (no misleading claims)
  - [ ] Health (not making medical claims)

---

### 5. Medical & Health Disclaimers

#### Critical Disclaimers
- [x] **NOT medical advice** (clearly stated in Terms)
- [x] **NOT medical treatment** (clearly stated in Terms)
- [x] **NOT substitute for professional care** (clearly stated in Terms)
- [x] **NOT FDA-approved medical device** (clearly stated in Terms)
- [x] **NOT HIPAA-covered** (we're not a healthcare provider)
- [x] **Crisis resources provided** (911, 988, NEDA hotline)
- [x] **Disclaimer in onboarding** (before user starts journaling)
- [ ] **Consider consulting FDA** (is app a medical device? probably not, but verify)
- [ ] **Review with healthcare attorney** (wellness vs. medical device classification)

#### Eating Disorder Specific
- [x] **ED-safe design** (no calorie/weight tracking, triggering features avoided)
- [x] **Professional treatment encouraged** (use alongside therapy/medical team)
- [x] **Not a treatment program** (clearly stated)
- [x] **Crisis resources for ED** (NEDA hotline: 1-800-931-2237)
- [ ] **Consider partnerships** with ED organizations (NEDA, ANAD) for resources/credibility

#### Liability Protection
- [x] **No warranties** ("AS IS")
- [x] **Limitation of liability** (no liability for health outcomes)
- [x] **User responsibility** (users responsible for their health decisions)
- [x] **Indemnification** (user indemnifies us)
- [ ] **Insurance obtained** (general liability, professional liability/E&O, cyber liability)
- [ ] **Consider additional medical malpractice insurance** (consult insurance broker)

---

### 6. Data Security & Privacy Implementation

#### Technical Security Measures
- [x] **Encryption in transit** (TLS/SSL for all API calls)
- [x] **Encryption at rest** (Supabase provides this)
- [x] **Password hashing** (bcrypt via Supabase Auth)
- [x] **Secure authentication** (JWT tokens, Supabase Auth)
- [ ] **Security audit conducted** (hire third-party security firm)
- [ ] **Penetration testing** (test for vulnerabilities)
- [ ] **Dependency scanning** (check for vulnerable packages - npm audit)
- [ ] **Code review** (security-focused code review)
- [ ] **Rate limiting** (prevent brute force attacks)
- [ ] **Input validation** (prevent SQL injection, XSS, etc.)
- [ ] **OWASP Top 10 compliance** (review and address)

#### Organizational Security Measures
- [ ] **Access controls** (least privilege principle)
- [ ] **Background checks** (for anyone with data access)
- [ ] **Security training** (for team members)
- [ ] **Incident response plan** (what to do if breach occurs)
- [ ] **Data Processing Agreements** (with Supabase and any vendors)
- [ ] **Vendor security review** (ensure Supabase meets standards)
- [ ] **Regular security audits** (quarterly or annual)
- [ ] **Log monitoring** (detect suspicious activity)

#### Data Breach Response
- [ ] **Breach notification plan** documented
  - [ ] Notify users within 72 hours (GDPR) or as required by law
  - [ ] Notify supervisory authorities (GDPR)
  - [ ] Notify state attorney general (some states require)
  - [ ] Template notification emails prepared
- [ ] **Breach response team** identified
- [ ] **Legal counsel on retainer** (for breach response)
- [ ] **PR/communications plan** (if breach occurs)
- [ ] **Cyber insurance** (covers breach response costs)

---

### 7. User Rights Implementation

#### Data Access
- [x] **User can view their data** (in-app - journal entries, moods, photos)
- [x] **User can request data copy** (email privacy@journalsafe.com)
- [ ] **Automated data access** (Settings → Download My Data - consider adding)
- [ ] **Response process documented** (how you'll fulfill requests within 30-45 days)

#### Data Export (Portability)
- [x] **Export functionality implemented** (Settings → Export Journal Entries)
- [x] **JSON format** (machine-readable)
- [x] **PDF/Text format** (human-readable)
- [ ] **Test export with real data** (ensure complete and accurate)
- [ ] **Include all user data** (entries, moods, photos, metadata)

#### Data Deletion
- [x] **Delete individual entries** (in-app)
- [x] **Delete all data** (Settings → Delete All Data)
- [x] **Delete account** (Settings → Delete Account)
- [x] **Grace period** (30 days to recover)
- [x] **Permanent deletion** (after 30 days)
- [x] **Backup deletion** (after 90 days)
- [ ] **Test deletion process** (ensure data is actually deleted)
- [ ] **Confirmation process** (prevent accidental deletion)
- [ ] **Deletion logs** (audit trail of deletions)

#### Opt-Out Mechanisms
- [x] **Opt-out of notifications** (Settings → Notifications)
- [x] **Opt-out of data sync** (Settings → Sync Data to Cloud)
- [ ] **Opt-out of marketing emails** (if you send them - currently N/A)
- [ ] **Opt-out of analytics** (if you add analytics)

---

### 8. Consent & Acceptance Mechanisms

#### Onboarding Consent
- [x] **Terms acceptance checkbox** (onboarding screen)
- [x] **Privacy Policy link** (onboarding screen)
- [x] **Terms of Service link** (onboarding screen)
- [x] **Medical disclaimer** (onboarding screen)
- [x] **Age confirmation** (13+ in checkbox text)
- [x] **Cannot proceed without acceptance** (disabled button until checked)
- [ ] **Log consent** (timestamp, IP address, user ID - for legal proof)
- [ ] **Consent audit trail** (store acceptance records)

#### Ongoing Consent
- [ ] **Re-consent on material changes** (if Privacy Policy or Terms change significantly)
- [ ] **Notification of changes** (email + in-app notification, 30 days advance)
- [ ] **Continued use = acceptance** (or require explicit re-acceptance)

---

### 9. Third-Party Services & Vendors

#### Supabase (Database & Auth)
- [x] **Data Processing Agreement** (review Supabase's DPA)
- [x] **Privacy Policy reviewed** (https://supabase.com/privacy)
- [x] **Security documentation reviewed** (https://supabase.com/security)
- [x] **GDPR compliance verified** (Supabase is GDPR-compliant)
- [ ] **Standard Contractual Clauses** (for EU data transfers - verify Supabase provides)
- [ ] **SOC 2 compliance verified** (Supabase has SOC 2 Type II)
- [ ] **Backup and recovery tested** (ensure you can recover data)

#### OpenAI (if using AI features)
- [ ] **API terms reviewed** (https://openai.com/policies/terms-of-use)
- [ ] **Data usage policy reviewed** (OpenAI doesn't train on API data as of 2023)
- [ ] **Privacy Policy updated** (disclose AI usage if using OpenAI)
- [ ] **User consent** (if using user data with AI)
- [ ] **API key secured** (environment variables, not in code)

#### Future Vendors (Analytics, Payment Processing, etc.)
- [ ] **Vendor security assessment** (before adding new services)
- [ ] **Data Processing Agreement** (with each vendor)
- [ ] **Privacy Policy updated** (disclose each new vendor)
- [ ] **User consent** (if new vendor processes personal data)

---

### 10. Payment & Monetization (Future - Freemium)

#### Payment Processing
- [ ] **Payment processor selected** (Stripe, Apple IAP, Google Play Billing)
- [ ] **PCI DSS compliance** (if handling credit cards - use processor that handles)
- [ ] **Payment terms added to Terms of Service**
- [ ] **Refund policy documented**
- [ ] **Subscription management** (cancel, pause, refund)
- [ ] **Privacy Policy updated** (disclose payment data collection)

#### Pricing & Subscriptions
- [x] **Free tier always available** (core features remain free)
- [x] **Grandfathering commitment** (MVP users get core features free forever)
- [x] **90-day notice before charging** (stated in Terms)
- [ ] **Pricing page created** (when freemium launches)
- [ ] **Fair billing practices** (pro-rated refunds, clear pricing)
- [ ] **Tax compliance** (sales tax, VAT, GST where applicable)

---

### 11. Marketing & Advertising Compliance

#### Health Claims
- [ ] **No medical claims** (don't claim to treat, cure, or prevent diseases)
- [ ] **No misleading claims** (be truthful about what app does)
- [ ] **Evidence-based claims** (if claiming benefits, have evidence)
- [ ] **FTC compliance** (substantiation, disclosures)
- [ ] **FDA oversight** (ensure not making app a medical device through marketing)

#### Testimonials & Reviews
- [ ] **FTC disclosure** (if featuring testimonials, disclose if compensated)
- [ ] **Typical results disclosure** (if showing results, disclose they may not be typical)
- [ ] **No fake reviews** (don't solicit or pay for fake reviews)

#### Email Marketing (if you do it)
- [ ] **CAN-SPAM compliance** (unsubscribe link, physical address, no deceptive headers)
- [ ] **Opt-in consent** (users must opt in to marketing emails)
- [ ] **Unsubscribe mechanism** (easy one-click unsubscribe)
- [ ] **GDPR consent** (if emailing EU users - explicit consent required)

---

### 12. Accessibility Compliance

#### ADA / WCAG Compliance
- [ ] **Screen reader support** (VoiceOver, TalkBack)
- [ ] **Sufficient color contrast** (WCAG AA: 4.5:1 for text)
- [ ] **Text sizing** (supports dynamic type, zoom)
- [ ] **Keyboard navigation** (if applicable)
- [ ] **Alt text for images** (describe images for screen readers)
- [ ] **Accessibility audit** (use tools like axe, WAVE)
- [ ] **Accessibility statement** (document accessibility features and how to request accommodations)

---

### 13. International Compliance (if expanding globally)

#### Country-Specific Requirements
- [ ] **Canada (PIPEDA)** - similar to GDPR
- [ ] **Australia (Privacy Act)** - similar to GDPR
- [ ] **Brazil (LGPD)** - similar to GDPR
- [ ] **China (PIPL)** - strict data localization, local representative
- [ ] **India (PDPB)** - pending, similar to GDPR
- [ ] **Other countries** - research requirements before launching

#### Data Localization
- [ ] **Review data storage location** (currently US - may need local storage for some countries)
- [ ] **Standard Contractual Clauses** (for international transfers)
- [ ] **Adequacy decisions** (EU-US Data Privacy Framework, if applicable)

---

### 14. Crisis Resources & Safety

#### In-App Crisis Resources
- [x] **Crisis hotlines listed** (911, 988, Crisis Text Line, NEDA)
- [x] **Help tab** (dedicated section for crisis resources)
- [x] **Easy to find** (Settings, Help tab, mentioned in onboarding)
- [ ] **International resources** (if you have international users)
- [ ] **Links to external resources** (NEDA, SAMHSA, AFSP, etc.)

#### Safety Features
- [ ] **Content warnings** (if showing potentially triggering content)
- [ ] **Reporting mechanism** (if adding community features)
- [ ] **Moderation** (if user-generated content visible to others)
- [ ] **Block/mute features** (if adding social features)

---

### 15. Documentation & Record Keeping

#### Legal Records
- [ ] **Consents logged** (timestamp, user ID, IP address, version of terms accepted)
- [ ] **Privacy Policy versions** (archive all previous versions)
- [ ] **Terms of Service versions** (archive all previous versions)
- [ ] **User deletion requests** (log and fulfill within required timeframe)
- [ ] **Data breach incidents** (document and retain records)
- [ ] **Legal notices received** (DMCA, subpoenas, etc.)

#### Compliance Records
- [ ] **Security audits** (reports and remediation plans)
- [ ] **Penetration tests** (reports and fixes)
- [ ] **Vendor agreements** (DPAs, contracts)
- [ ] **Data processing inventory** (what data, why, where, how long)
- [ ] **Risk assessments** (DPIA for high-risk processing)

---

### 16. Team & Roles

#### Legal & Compliance Team
- [ ] **Legal counsel** (attorney on retainer or in-house)
- [ ] **Privacy officer** (responsible for privacy compliance)
- [ ] **Security officer** (responsible for security)
- [ ] **Data Protection Officer** (if required by GDPR)
- [ ] **EU Representative** (if required by GDPR)

#### Training
- [ ] **Privacy training** (for all team members)
- [ ] **Security training** (for all team members)
- [ ] **Compliance training** (for relevant team members)
- [ ] **Crisis response training** (for support team)

---

### 17. Insurance & Risk Management

#### Insurance Coverage
- [ ] **General Liability Insurance** (protects against bodily injury, property damage)
- [ ] **Professional Liability / E&O Insurance** (protects against professional negligence)
- [ ] **Cyber Liability Insurance** (protects against data breaches, cyber attacks)
- [ ] **Directors & Officers Insurance** (if you have a board)
- [ ] **Employment Practices Liability** (if you have employees)

#### Risk Assessment
- [ ] **Legal risks identified** (lawsuits, regulatory action, etc.)
- [ ] **Privacy risks identified** (data breach, unauthorized access, etc.)
- [ ] **Security risks identified** (hacking, malware, etc.)
- [ ] **Business risks identified** (competition, market changes, etc.)
- [ ] **Mitigation strategies** (for each risk)

---

### 18. Ongoing Compliance

#### Regular Reviews
- [ ] **Quarterly privacy policy review** (ensure still accurate)
- [ ] **Quarterly terms of service review** (ensure still accurate)
- [ ] **Quarterly security audit** (check for vulnerabilities)
- [ ] **Annual legal review** (with attorney)
- [ ] **Annual insurance review** (ensure adequate coverage)

#### Monitoring
- [ ] **Law changes monitored** (GDPR, CCPA, state laws, etc.)
- [ ] **App store policy changes monitored** (Apple, Google)
- [ ] **Vendor policy changes monitored** (Supabase, etc.)
- [ ] **Security threats monitored** (vulnerabilities, attacks)

#### Updates & Changes
- [ ] **Process for updating Privacy Policy** (legal review, user notification, archival)
- [ ] **Process for updating Terms of Service** (legal review, user notification, archival)
- [ ] **Process for material changes** (30-day notice, re-consent if needed)

---

## Priority Action Items (Before Launch)

### CRITICAL (Must Complete Before Launch)
1. [ ] **Hire attorney** to review Privacy Policy and Terms of Service
2. [ ] **Register company** and obtain EIN
3. [ ] **Set up legal email addresses** (legal@, privacy@, security@, support@)
4. [ ] **Obtain insurance** (general liability, E&O, cyber liability)
5. [ ] **Update Privacy Policy and Terms** with actual company information
6. [ ] **Security audit** (third-party review of code and infrastructure)
7. [ ] **Test data export and deletion** (ensure works correctly)
8. [ ] **App Store privacy labels** configured correctly
9. [ ] **Consent logging implemented** (record user acceptance of terms)
10. [ ] **Vendor agreements reviewed** (especially Supabase DPA)

### HIGH PRIORITY (Complete Soon After Launch)
1. [ ] **Penetration testing** (hire security firm to test for vulnerabilities)
2. [ ] **Breach response plan** finalized
3. [ ] **Staff training** (privacy, security, crisis response)
4. [ ] **Accessibility audit** (ensure WCAG compliance)
5. [ ] **International compliance** (if expanding globally)

### MEDIUM PRIORITY (Within First 6 Months)
1. [ ] **Annual legal review** (schedule recurring)
2. [ ] **Transparency report** (publish first report)
3. [ ] **User education** (create help articles about privacy and security)
4. [ ] **Privacy-enhancing features** (explore additional privacy controls)

---

## Resources & References

### Legal Resources
- **Privacy Policies:**
  - IAPP (International Association of Privacy Professionals): https://iapp.org/
  - Privacy Policy Generator: https://www.termsfeed.com/ (use with attorney review)

- **Terms of Service:**
  - TermsFeed: https://www.termsfeed.com/
  - Sample terms from established apps (Headspace, Calm, etc.)

### Regulatory Resources
- **GDPR:** https://gdpr.eu/
- **CCPA:** https://oag.ca.gov/privacy/ccpa
- **COPPA:** https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa
- **HIPAA:** https://www.hhs.gov/hipaa/index.html (note: Journal Safe is NOT HIPAA-covered)
- **FTC:** https://www.ftc.gov/ (advertising, marketing compliance)
- **FDA:** https://www.fda.gov/ (medical device classification)

### App Store Policies
- **Apple App Store Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Google Play Policy Center:** https://play.google.com/about/developer-content-policy/

### Security Resources
- **OWASP (Open Web Application Security Project):** https://owasp.org/
- **NIST Cybersecurity Framework:** https://www.nist.gov/cyberframework
- **CIS Controls:** https://www.cisecurity.org/controls

### Crisis Resources (to link in app)
- **988 Suicide & Crisis Lifeline:** https://988lifeline.org/
- **Crisis Text Line:** https://www.crisistextline.org/
- **NEDA (National Eating Disorders Association):** https://www.nationaleatingdisorders.org/
- **SAMHSA (Substance Abuse and Mental Health Services):** https://www.samhsa.gov/

---

## Contact Information for Legal Compliance

**Before you launch, set up these email addresses:**

| Email | Purpose | Auto-Response? |
|-------|---------|----------------|
| legal@journalsafe.com | Legal notices, terms questions | Yes - "We'll respond within 3 business days" |
| privacy@journalsafe.com | Privacy requests (GDPR, CCPA) | Yes - "We'll respond within 30-45 days per law" |
| security@journalsafe.com | Security issues, breach reports | Yes - "We'll respond within 24 hours for urgent issues" |
| support@journalsafe.com | General user support | Yes - "We'll respond within 2 business days" |
| dpo@journalsafe.com | Data Protection Officer (if required) | Yes - "We'll respond within 30 days" |

---

## Final Reminder

**This checklist is comprehensive but NOT exhaustive.**

**ALWAYS:**
- Consult with qualified legal counsel
- Stay up-to-date with changing laws
- Prioritize user privacy and safety
- Document everything
- Be transparent with users
- Err on the side of caution

**When in doubt, ask an attorney.**

Good luck with Journal Safe! 🚀

---

**Last Updated:** November 17, 2025
**Next Review:** Before Production Launch
**Maintained By:** Journal Safe Legal & Compliance Team
