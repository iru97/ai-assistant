/**
 * Journal Safe MVP - Terms of Service Screen
 * Displays the full terms of service in a scrollable, readable format
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
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function TermsOfServiceScreen() {
  const openEmail = (type: 'legal' | 'support') => {
    const emails = {
      legal: 'legal@journalsafe.com',
      support: 'support@journalsafe.com',
    };
    Linking.openURL(`mailto:${emails[type]}`);
  };

  const openCrisisResources = () => {
    Alert.alert(
      'Crisis Resources',
      'If you are in crisis or having thoughts of self-harm:\n\n' +
        '🆘 Call 911 (Emergency)\n' +
        '📞 988 Suicide & Crisis Lifeline\n' +
        '💬 Text "HELLO" to 741741 (Crisis Text Line)\n' +
        '🆘 NEDA Hotline: 1-800-931-2237',
      [
        { text: 'OK', style: 'default' },
        {
          text: 'Call 988',
          onPress: () => Linking.openURL('tel:988'),
          style: 'default',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1d1d1d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
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
          <Text style={styles.h1}>Terms of Service</Text>
          <Text style={styles.paragraph}>
            Thank you for choosing Journal Safe as your wellness companion. These Terms of Service
            govern your use of the Journal Safe mobile application.
            {'\n\n'}
            <Text style={styles.bold}>
              By creating an account or using Journal Safe, you agree to these Terms.
            </Text> If you do not agree, please do not use the app.
          </Text>
        </View>

        {/* Quick Summary */}
        <View style={[styles.section, styles.summaryBox]}>
          <Text style={styles.h2}>Quick Summary (Not Legally Binding)</Text>
          <Text style={styles.paragraph}>
            ✅ <Text style={styles.bold}>You Must Be 13+</Text> to use Journal Safe
            {'\n\n'}
            ✅ <Text style={styles.bold}>You Own Your Content</Text> - We never claim ownership of
            your journal entries
            {'\n\n'}
            ✅ <Text style={styles.bold}>Not Medical Advice</Text> - Journal Safe is a wellness
            tool, not healthcare
            {'\n\n'}
            ✅ <Text style={styles.bold}>Crisis? Call 911 or 988</Text> - Don't rely on Journal
            Safe in emergencies
            {'\n\n'}
            ✅ <Text style={styles.bold}>Free for Now</Text> - MVP is free; we'll notify you before
            charging
            {'\n\n'}
            ✅ <Text style={styles.bold}>You Can Leave Anytime</Text> - Delete your account with
            30-day data retention
          </Text>
        </View>

        {/* Medical Disclaimer - CRITICAL */}
        <View style={[styles.section, styles.warningBox]}>
          <View style={styles.warningHeader}>
            <Feather name="alert-triangle" size={24} color="#DC2626" />
            <Text style={styles.warningTitle}>CRITICAL: Medical Disclaimer</Text>
          </View>
          <Text style={styles.warningText}>
            <Text style={styles.bold}>
              JOURNAL SAFE IS NOT MEDICAL ADVICE, TREATMENT, OR A SUBSTITUTE FOR PROFESSIONAL CARE
            </Text>
            {'\n\n'}
            Journal Safe is a wellness and journaling tool ONLY. It is:
            {'\n\n'}
            ❌ NOT a medical device{'\n'}
            ❌ NOT FDA-approved for medical use{'\n'}
            ❌ NOT a substitute for therapy or counseling{'\n'}
            ❌ NOT designed to diagnose, treat, cure, or prevent any disease{'\n'}
            ❌ NOT covered by HIPAA
            {'\n\n'}
            <Text style={styles.bold}>Always consult healthcare professionals for medical advice.</Text>
          </Text>

          <TouchableOpacity style={styles.crisisButton} onPress={openCrisisResources}>
            <Feather name="life-buoy" size={20} color="#fff" />
            <Text style={styles.crisisButtonText}>Crisis Resources (911, 988)</Text>
          </TouchableOpacity>
        </View>

        {/* Crisis Information */}
        <View style={[styles.section, styles.crisisBox]}>
          <Text style={styles.h2}>Not for Crisis Situations</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>
              IF YOU ARE IN CRISIS OR HAVING THOUGHTS OF SELF-HARM:
            </Text>
            {'\n\n'}
            <Text style={styles.bold}>DO NOT</Text> rely on Journal Safe. Get immediate help:
            {'\n\n'}
            🆘 <Text style={styles.bold}>Call 911</Text> (United States Emergency)
            {'\n'}
            📞 <Text style={styles.bold}>988 Suicide & Crisis Lifeline</Text> (call or text 988)
            {'\n'}
            💬 <Text style={styles.bold}>Crisis Text Line:</Text> Text "HELLO" to 741741
            {'\n'}
            🆘 <Text style={styles.bold}>NEDA Hotline:</Text> 1-800-931-2237 or text "NEDA" to
            741741
            {'\n\n'}
            Journal Safe cannot provide emergency response, crisis counseling, or safety
            intervention.
          </Text>
        </View>

        {/* Eligibility */}
        <View style={styles.section}>
          <Text style={styles.h2}>1. Eligibility</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>You must be at least 13 years old</Text> to use Journal Safe.
            {'\n\n'}
            By creating an account, you confirm that:
            {'\n\n'}• You are at least 13 years of age
            {'\n'}• You have the legal capacity to enter into this agreement
            {'\n'}• If you are between 13-18, you have parental/guardian consent
          </Text>
        </View>

        {/* Account Registration */}
        <View style={styles.section}>
          <Text style={styles.h2}>2. Account Registration & Security</Text>

          <Text style={styles.h3}>Your Responsibility</Text>
          <Text style={styles.paragraph}>
            You are responsible for:
            {'\n\n'}• Maintaining the confidentiality of your password
            {'\n'}• All activities that occur under your account
            {'\n'}• Using a strong, unique password
            {'\n'}• Logging out on shared devices
            {'\n'}• Notifying us immediately of unauthorized access
          </Text>

          <Text style={styles.h3}>What We're NOT Responsible For</Text>
          <Text style={styles.paragraph}>
            • Losses from your failure to secure your account
            {'\n'}• Unauthorized access due to your disclosure of credentials
          </Text>
        </View>

        {/* User Responsibilities */}
        <View style={styles.section}>
          <Text style={styles.h2}>3. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>You agree to use Journal Safe:</Text>
            {'\n\n'}• For personal wellness and journaling purposes
            {'\n'}• In compliance with all applicable laws
            {'\n'}• Respectfully and responsibly
            {'\n'}• Without harming us or other users
            {'\n\n'}
            <Text style={styles.bold}>You agree NOT to:</Text>
            {'\n\n'}❌ Use the app for illegal purposes
            {'\n'}❌ Store illegal content
            {'\n'}❌ Attempt to hack or breach our security
            {'\n'}❌ Reverse engineer or decompile the app
            {'\n'}❌ Use bots or automated tools
            {'\n'}❌ Interfere with the app's functionality
          </Text>
        </View>

        {/* Content Ownership */}
        <View style={styles.section}>
          <Text style={styles.h2}>4. Content Ownership</Text>

          <Text style={styles.h3}>You Own Your Content</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>You own your journal content.</Text> This includes:
            {'\n\n'}• Journal entries you write
            {'\n'}• Photos you upload
            {'\n'}• Mood logs you create
            {'\n'}• All other content you create
            {'\n\n'}
            <Text style={styles.bold}>We do NOT claim ownership of your journal content.</Text>
          </Text>

          <Text style={styles.h3}>License You Grant Us</Text>
          <Text style={styles.paragraph}>
            You grant us a limited license to:
            {'\n\n'}• Store your content on our servers
            {'\n'}• Display your content to you in the app
            {'\n'}• Backup your content for disaster recovery
            {'\n'}• Sync your content across your devices
            {'\n\n'}
            This license is non-exclusive, limited, and revocable. It ends when you delete your
            content or account.
          </Text>

          <Text style={styles.h3}>Data Export & Deletion</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Export:</Text> Settings → Data Management → Export Journal
            Entries
            {'\n\n'}
            <Text style={styles.bold}>Delete:</Text> Settings → Account → Delete Account
            {'\n\n'}
            After deletion, data is retained for 30 days (grace period), then permanently deleted.
            Backups are deleted after 90 days.
          </Text>
        </View>

        {/* Health & Wellness Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.h2}>5. Health & Wellness Disclaimer</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Eating Disorder Considerations:</Text>
            {'\n\n'}
            If you are in eating disorder recovery:
            {'\n\n'}
            ✅ Journal Safe is designed to be ED-safe (no calorie/weight tracking)
            {'\n'}
            ✅ Use alongside professional treatment (therapist, dietitian, medical team)
            {'\n'}
            ⚠️ If journaling becomes triggering, stop using the app
            {'\n'}
            ⚠️ Journal Safe is not a treatment program—it's a personal wellness tool
            {'\n\n'}
            <Text style={styles.bold}>Your Responsibility for Your Health:</Text>
            {'\n\n'}
            You are solely responsible for:
            {'\n\n'}• Your health decisions and outcomes
            {'\n'}• Seeking appropriate professional care
            {'\n'}• Following your treatment plan
            {'\n'}• Recognizing when you need professional help
          </Text>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.h2}>6. Subscription & Payments</Text>

          <Text style={styles.h3}>Current Pricing (MVP)</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Journal Safe is currently FREE.</Text>
            {'\n\n'}
            All features are available at no cost during our MVP phase.
          </Text>

          <Text style={styles.h3}>Future Pricing (Freemium)</Text>
          <Text style={styles.paragraph}>
            We may introduce a freemium model in the future:
            {'\n\n'}• <Text style={styles.bold}>Free Tier:</Text> Core journaling features (always
            free)
            {'\n'}• <Text style={styles.bold}>Premium Tier:</Text> Advanced features (~$4.99/month)
            {'\n\n'}
            <Text style={styles.bold}>
              We will notify you 90 days before charging for any features.
            </Text>
            {'\n\n'}
            <Text style={styles.bold}>Grandfathering Promise:</Text> If you create a free account
            during MVP, core features will remain free for you forever.
          </Text>
        </View>

        {/* Disclaimers */}
        <View style={styles.section}>
          <Text style={styles.h2}>7. Disclaimers & Limitations</Text>

          <Text style={styles.h3}>"AS IS" Service</Text>
          <Text style={styles.paragraph}>
            Journal Safe is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.
            {'\n\n'}
            We do NOT guarantee:
            {'\n\n'}• The app will meet your requirements
            {'\n'}• The app will be available 24/7 without interruption
            {'\n'}• All bugs will be corrected
            {'\n'}• Compatibility with all devices
            {'\n'}• Your data will never be lost (though we make best efforts)
          </Text>

          <Text style={styles.h3}>Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE ARE NOT LIABLE FOR:
            </Text>
            {'\n\n'}• Indirect, incidental, or consequential damages
            {'\n'}• Loss of profits, revenue, or data
            {'\n'}• Health outcomes or decisions you make
            {'\n'}• Emotional distress
            {'\n'}• Damages exceeding $0 (for free users)
            {'\n\n'}
            <Text style={styles.bold}>Use at your own risk.</Text>
          </Text>
        </View>

        {/* Termination */}
        <View style={styles.section}>
          <Text style={styles.h2}>8. Termination</Text>

          <Text style={styles.h3}>You Can Leave Anytime</Text>
          <Text style={styles.paragraph}>
            Settings → Account → Delete Account
            {'\n\n'}
            • Account access ends immediately
            {'\n'}• Data retained for 30-day grace period
            {'\n'}• After 30 days, permanently deleted
            {'\n'}• Backups deleted after 90 days
          </Text>

          <Text style={styles.h3}>We May Terminate Accounts If:</Text>
          <Text style={styles.paragraph}>
            • You violate these Terms
            {'\n'}• You engage in illegal or harmful activity
            {'\n'}• You abuse or misuse the app
            {'\n'}• We're required by law
            {'\n'}• We discontinue the service (with 90 days' notice)
          </Text>
        </View>

        {/* Governing Law */}
        <View style={styles.section}>
          <Text style={styles.h2}>9. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms are governed by the laws of the United States [specify state when company is
            registered].
            {'\n\n'}
            <Text style={styles.bold}>Informal Dispute Resolution:</Text>
            {'\n\n'}
            Before filing a lawsuit, please:
            {'\n\n'}
            1. Contact legal@journalsafe.com describing the dispute
            {'\n'}
            2. Give us 60 days to attempt resolution
            {'\n'}
            3. Participate in good-faith negotiations
            {'\n\n'}
            Most disputes can be resolved informally.
          </Text>
        </View>

        {/* Changes to Terms */}
        <View style={styles.section}>
          <Text style={styles.h2}>10. Changes to These Terms</Text>
          <Text style={styles.paragraph}>
            We may update these Terms from time to time.
            {'\n\n'}
            <Text style={styles.bold}>Material changes:</Text>
            {'\n'}• 30 days' advance notice via email
            {'\n'}• Opportunity to review before they take effect
            {'\n'}• Continued use = acceptance
            {'\n\n'}
            <Text style={styles.bold}>If you don't agree:</Text>
            {'\n'}• Stop using Journal Safe
            {'\n'}• Delete your account before changes take effect
            {'\n'}• Export your data first (recommended)
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.h2}>11. Contact Us</Text>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => openEmail('legal')}>
            <Feather name="mail" size={20} color="#7c3aed" />
            <View style={styles.contactButtonText}>
              <Text style={styles.contactButtonTitle}>Legal Questions</Text>
              <Text style={styles.contactButtonEmail}>legal@journalsafe.com</Text>
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

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for reading our Terms of Service.
            {'\n\n'}
            By using Journal Safe, you agree to these Terms.
            {'\n\n'}
            We're committed to providing a safe, private, and supportive space for your wellness
            journey.
            {'\n\n'}
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
  summaryBox: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  warningBox: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 12,
    flex: 1,
  },
  warningText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#7f1d1d',
  },
  crisisBox: {
    backgroundColor: '#fff7ed',
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
  },
  crisisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  crisisButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
