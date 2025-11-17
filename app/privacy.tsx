/**
 * Journal Safe MVP - Privacy Policy Screen
 * Displays the full privacy policy in a scrollable, readable format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function PrivacyPolicyScreen() {
  const openEmail = (type: 'privacy' | 'security' | 'support') => {
    const emails = {
      privacy: 'privacy@journalsafe.com',
      security: 'security@journalsafe.com',
      support: 'support@journalsafe.com',
    };
    Linking.openURL(`mailto:${emails[type]}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1d1d1d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
        {/* Last Updated */}
        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>Last Updated: November 17, 2025</Text>
        </View>

        {/* Disclaimer Banner */}
        <View style={styles.disclaimerBanner}>
          <Feather name="info" size={20} color="#7c3aed" />
          <Text style={styles.disclaimerText}>
            This is a template. Consult with a qualified attorney before using in production.
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.h1}>Privacy Policy</Text>
          <Text style={styles.paragraph}>
            Welcome to <Text style={styles.bold}>Journal Safe</Text>. We built this app to provide
            a safe, private space for your wellness journey. Your privacy is not just important to
            us—it's fundamental to everything we do.
          </Text>
        </View>

        {/* Core Principles */}
        <View style={styles.section}>
          <Text style={styles.h2}>Our Core Privacy Principles</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>
              <Text style={styles.bold}>Your data is YOUR data.</Text> You own your journal
              entries, photos, and all content you create.
            </Text>
            <Text style={styles.bullet}>
              <Text style={styles.bold}>We never sell your data.</Text> Not to advertisers,
              insurance companies, employers, or anyone else. Period.
            </Text>
            <Text style={styles.bullet}>
              <Text style={styles.bold}>Minimal collection.</Text> We only collect what's necessary
              to make the app work.
            </Text>
            <Text style={styles.bullet}>
              <Text style={styles.bold}>You're in control.</Text> Export your data, delete your
              account, or opt out anytime.
            </Text>
          </View>
        </View>

        {/* What We Collect */}
        <View style={styles.section}>
          <Text style={styles.h2}>1. Information We Collect</Text>

          <Text style={styles.h3}>Account Information</Text>
          <Text style={styles.paragraph}>
            • Email address (required){'\n'}• Display name (optional, you can use a pseudonym)
            {'\n'}• Profile photo (optional){'\n'}• Password (stored encrypted)
          </Text>

          <Text style={styles.h3}>Journal Content</Text>
          <Text style={styles.paragraph}>
            • Journal entries you write{'\n'}• Mood check-ins you log{'\n'}• Photos you attach
            {'\n'}• Affirmation preferences{'\n'}• Tags and categories
          </Text>

          <Text style={styles.h3}>What We DON'T Collect</Text>
          <Text style={styles.paragraph}>
            ❌ Location tracking{'\n'}❌ Contacts access{'\n'}❌ Browsing history{'\n'}❌
            Advertising trackers{'\n'}❌ Third-party analytics
          </Text>
        </View>

        {/* How We Use Information */}
        <View style={styles.section}>
          <Text style={styles.h2}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use your information ONLY to provide and improve Journal Safe:
            {'\n\n'}
            • Store your journal entries securely{'\n'}• Sync your data across devices{'\n'}• Send
            affirmations (if you enable notifications){'\n'}• Fix bugs and improve performance
            {'\n\n'}
            <Text style={styles.bold}>
              We will never use your journal content for marketing or advertising.
            </Text>
          </Text>
        </View>

        {/* Data Storage & Security */}
        <View style={styles.section}>
          <Text style={styles.h2}>3. How We Store & Protect Your Data</Text>

          <Text style={styles.h3}>Storage Location</Text>
          <Text style={styles.paragraph}>
            Your data is stored on Supabase (hosted on AWS in the United States).
          </Text>

          <Text style={styles.h3}>Security Measures</Text>
          <Text style={styles.paragraph}>
            ✅ Encryption in transit (TLS/SSL){'\n'}✅ Encryption at rest{'\n'}✅ Secure password
            hashing (bcrypt){'\n'}✅ Regular security audits{'\n'}✅ Limited access (no one reads
            your journals)
          </Text>
        </View>

        {/* Data Sharing */}
        <View style={styles.section}>
          <Text style={styles.h2}>4. Data Sharing</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>We DO NOT:</Text>
            {'\n\n'}
            ❌ Sell your personal information{'\n'}❌ Share your journal content with third parties
            {'\n'}❌ Share your data with advertisers{'\n'}❌ Share your data with insurance
            companies or employers
            {'\n\n'}
            We only use Supabase for database and authentication services. They are contractually
            required to protect your data and cannot use it for their own purposes.
          </Text>
        </View>

        {/* Your Rights */}
        <View style={styles.section}>
          <Text style={styles.h2}>5. Your Privacy Rights</Text>

          <Text style={styles.h3}>Access Your Data</Text>
          <Text style={styles.paragraph}>
            Contact privacy@journalsafe.com to request a copy of your data.
          </Text>

          <Text style={styles.h3}>Export Your Data</Text>
          <Text style={styles.paragraph}>
            Settings → Data Management → Export Journal Entries (JSON or PDF format)
          </Text>

          <Text style={styles.h3}>Delete Your Data</Text>
          <Text style={styles.paragraph}>
            Settings → Account → Delete Account{'\n\n'}Data is retained for 30 days, then
            permanently deleted. Backups are deleted after 90 days.
          </Text>

          <Text style={styles.h3}>Opt Out of Communications</Text>
          <Text style={styles.paragraph}>
            Settings → Notifications → Toggle off specific types
          </Text>
        </View>

        {/* GDPR & CCPA */}
        <View style={styles.section}>
          <Text style={styles.h2}>6. Regional Privacy Rights</Text>

          <Text style={styles.h3}>European Union (GDPR)</Text>
          <Text style={styles.paragraph}>
            If you're in the EU/EEA/UK, you have additional rights:{'\n\n'}• Right to access
            {'\n'}• Right to rectification{'\n'}• Right to erasure ("right to be forgotten"){'\n'}
            • Right to data portability{'\n'}• Right to object{'\n'}• Right to lodge a complaint
            with supervisory authority
          </Text>

          <Text style={styles.h3}>California (CCPA/CPRA)</Text>
          <Text style={styles.paragraph}>
            If you're a California resident:{'\n\n'}• Right to know what data we collect{'\n'}•
            Right to delete your data{'\n'}• Right to correct inaccurate data{'\n'}• Right to
            opt-out of sale (not applicable—we don't sell data)
          </Text>
        </View>

        {/* Children's Privacy */}
        <View style={styles.section}>
          <Text style={styles.h2}>7. Children's Privacy (COPPA)</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>
              Journal Safe is NOT intended for children under 13 years old.
            </Text>
            {'\n\n'}
            We do not knowingly collect information from children under 13. If you're under 13,
            please do not use Journal Safe.
            {'\n\n'}
            If you believe your child has provided information to us, contact
            privacy@journalsafe.com immediately.
          </Text>
        </View>

        {/* Sensitive Information */}
        <View style={styles.section}>
          <Text style={styles.h2}>8. Sensitive Information (ED Recovery)</Text>
          <Text style={styles.paragraph}>
            We understand that wellness and recovery are deeply personal. Your journal may contain
            sensitive information about your health and emotions.
            {'\n\n'}
            <Text style={styles.bold}>Extra Privacy Protections:</Text>
            {'\n\n'}• We treat all journal content as highly sensitive{'\n'}• No one on our team
            reads your journal entries{'\n'}• We will never share your health information{'\n'}•
            You can use a pseudonym instead of your real name{'\n'}• Your data will never be shared
            with insurance companies or employers
            {'\n\n'}
            <Text style={styles.bold}>Not Covered by HIPAA:</Text> Journal Safe is a wellness app,
            not a medical service. We are NOT covered by HIPAA. For HIPAA-protected care, work with
            a licensed healthcare provider.
          </Text>
        </View>

        {/* Changes to Policy */}
        <View style={styles.section}>
          <Text style={styles.h2}>9. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. Material changes will be
            communicated via email and in-app notification 30 days before taking effect.
            {'\n\n'}
            Continued use after changes take effect means you accept the updated policy.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.h2}>10. Contact Us</Text>
          <Text style={styles.paragraph}>
            We're here to answer your privacy questions and help you exercise your rights.
          </Text>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => openEmail('privacy')}>
            <Feather name="mail" size={20} color="#7c3aed" />
            <View style={styles.contactButtonText}>
              <Text style={styles.contactButtonTitle}>Privacy Inquiries</Text>
              <Text style={styles.contactButtonEmail}>privacy@journalsafe.com</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => openEmail('security')}>
            <Feather name="shield" size={20} color="#FF3B30" />
            <View style={styles.contactButtonText}>
              <Text style={styles.contactButtonTitle}>Security Concerns</Text>
              <Text style={styles.contactButtonEmail}>security@journalsafe.com</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => openEmail('support')}>
            <Feather name="help-circle" size={20} color="#007AFF" />
            <View style={styles.contactButtonText}>
              <Text style={styles.contactButtonTitle}>General Support</Text>
              <Text style={styles.contactButtonEmail}>support@journalsafe.com</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Commitment */}
        <View style={styles.section}>
          <Text style={styles.h2}>Your Privacy, Your Control</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Remember:</Text>
            {'\n\n'}• You own your data, not us{'\n'}• You can export it anytime{'\n'}• You can
            delete it anytime{'\n'}• We never sell it{'\n'}• We protect it with strong security
            {'\n'}• You have rights—we'll help you exercise them
            {'\n\n'}
            Thank you for trusting Journal Safe with your wellness journey. Your privacy and safety
            are our top priorities.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last Updated: November 17, 2025{'\n'}Version: 1.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  content: {
    flex: 1,
  },
  lastUpdated: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
  },
  lastUpdatedText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#5b21b6',
    marginLeft: 12,
    lineHeight: 18,
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 12,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 12,
    marginTop: 8,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1d',
    marginBottom: 8,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
  },
  bold: {
    fontWeight: '600',
    color: '#1d1d1d',
  },
  bulletList: {
    marginTop: 8,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
    paddingLeft: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contactButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  contactButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1d',
    marginBottom: 2,
  },
  contactButtonEmail: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
