import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Image } from 'react-native';
import { Bubble, GiftedChat, IMessage } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '~/constants/theme';
import { useTheme } from '~/themes/ThemeProvider';

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

  // Implementing chat generation using gpt-3.5-turbo model
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
      console.error(process.env.EXPO_PUBLIC_OPENAI_API_KEY);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.EXPO_PUBLIC_OPENAI_API_KEY,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo-16k',
          messages: [
            {
              role: 'user',
              content: inputMessage,
            },
          ],
        }),
      });
      if (!response) alert('no response');
      if (!response.ok) {
        console.error(response);
        throw new Error(JSON.stringify(response));
      }
      const responseJson = await response.json();

      if (!responseJson) alert('no response json');
      alert(responseJson.choices[0].message.content);
      console.log(responseJson.choices[0].message.content);

      const messageContent = responseJson.choices[0].message.content;

      setInputMessage('');
      setOutputMessage(messageContent.trim());

      const newMessage = {
        _id: Math.random().toString(36).substring(7),
        text: messageContent.trim(),
        createAt: new Date(),
        user: { _id: 2, name: 'ChatGPT' },
      };

      setIsTyping(false);
      setMessages((prevState) =>
        GiftedChat.append(prevState, [newMessage] as unknown as IMessage[])
      );
    } catch (error) {
      alert(error);
    }
  };

  // implementing images generations
  /*   const generateImages = () => {
    setIsTyping(true);
    const message = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: new Date(),
      user: { _id: 1 },
    };

    setMessages((previousMessage) => GiftedChat.append(previousMessage, [message]));

    fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        prompt: inputMessage,
        n: 1,
        size: '1024x1024',
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.data[0].url);
        setInputMessage('');
        setOutputMessage(data.data[0].url);
        setIsTyping(false);

        data.data.forEach((item: any) => {
          const message = {
            _id: Math.random().toString(36).substring(7),
            text: 'Image',
            createdAt: new Date(),
            user: { _id: 2, name: 'ChatGPT' },
            image: item.url,
          };

          setMessages((previousMessage) => GiftedChat.append(previousMessage, [message]));
        });
      });
  }; */

  const submitHandler = async () => {
    await generateText();
    /*     if (inputMessage.toLowerCase().startsWith('generate image')) {
      generateImages();
    } else {
      await generateText();
    } */
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
          renderInputToolbar={() => null}
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
