import { FontAwesome } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Bubble, GiftedChat, IMessage } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '~/constants/theme';
import { useTheme } from '~/themes/ThemeProvider';
import { supabase } from '~/utils/supabase';

const Chat = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [outputMessage, setOutputMessage] = useState('Results should be shown here.');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([] as IMessage[]);
  const { colors } = useTheme();

  const renderMessage = (props: any) => {
    const { currentMessage } = props;

    if (currentMessage.user._id === 1) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}>
          <Bubble
            {...props}
            wrapperStyle={{
              right: {
                backgroundColor: COLORS.primary,
                marginRight: 12,
                marginVertical: 12,
              },
            }}
            textStyle={{
              right: {
                color: COLORS.white,
              },
            }}
          />
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}>
          <Image
            /* source={images.avatar} */
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              marginLeft: 8,
            }}
          />
          <Bubble
            {...props}
            wrapperStyle={{
              left: {
                backgroundColor: COLORS.secondaryWhite,
                marginLeft: 12,
              },
            }}
            textStyle={{
              left: {
                color: COLORS.black,
              },
            }}
          />
        </View>
      );
    }
  };

  // Implementing chat generation using Supabase Edge Function
  const generateText = async () => {
    setIsTyping(true);
    const message = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createAt: new Date(),
      user: { _id: 1 },
    };

    setMessages((prevState) => GiftedChat.append(prevState, [message] as unknown as IMessage[]));

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert('Error', 'You must be logged in to use the chat');
        setIsTyping(false);
        return;
      }

      // Get Supabase URL from environment
      const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;

      if (!supabaseUrl) {
        Alert.alert('Error', 'Supabase URL not configured');
        setIsTyping(false);
        return;
      }

      // Call the Supabase Edge Function instead of OpenAI directly
      const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: inputMessage,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const responseJson = await response.json();

      if (!responseJson?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from server');
      }

      const messageContent = responseJson.choices[0].message.content;

      setInputMessage('');
      setOutputMessage(messageContent.trim());

      const newMessage = {
        _id: Math.random().toString(36).substring(7),
        text: messageContent.trim(),
        createAt: new Date(),
        user: { _id: 2, name: 'AI Assistant' },
      };

      setIsTyping(false);
      setMessages((prevState) =>
        GiftedChat.append(prevState, [newMessage] as unknown as IMessage[])
      );
    } catch (error) {
      setIsTyping(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to get response: ${errorMessage}`);
      console.error('Chat error:', error);
    }
  };

  // Note: Image generation would need a separate Edge Function
  // to avoid exposing the OpenAI API key

  const submitHandler = async () => {
    if (!inputMessage.trim()) {
      return;
    }
    await generateText();
  };

  const handleInputText = (text: string) => {
    setInputMessage(text);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}>
      <StatusBar style="auto" />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <GiftedChat
          messages={messages}
          renderInputToolbar={() => {}}
          user={{ _id: 1 }}
          minInputToolbarHeight={0}
          renderMessage={renderMessage}
          isTyping={isTyping}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.background,
          paddingVertical: 8,
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            marginLeft: 10,
            backgroundColor: colors.background,
            paddingVertical: 8,
            marginHorizontal: 12,
            borderRadius: 12,
            borderColor: colors.text,
            borderWidth: 0.2,
          }}>
          <TextInput
            value={inputMessage}
            onChangeText={handleInputText}
            placeholder="Enter your question"
            placeholderTextColor={colors.text}
            style={{
              color: colors.text,
              flex: 1,
              paddingHorizontal: 10,
            }}
          />

          <TouchableOpacity
            onPress={submitHandler}
            style={{
              padding: 6,
              borderRadius: 8,
              marginHorizontal: 12,
            }}>
            <FontAwesome name="send-o" color={COLORS.primary} size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = {};
export default Chat;
