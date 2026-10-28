/**
 * Ứng Dụng Quản Lý Sân Bóng Mini (FootballFieldApp)
 * Thiết kế chuẩn kiến trúc React Native sạch (Clean Architecture)
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { FootballProvider } from './src/context/FootballContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <FootballProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </FootballProvider>
    </SafeAreaProvider>
  );
}

export default App;
