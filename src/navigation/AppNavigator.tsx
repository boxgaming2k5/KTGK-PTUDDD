import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme';
import FieldListScreen from '../screens/FieldListScreen';
import FieldDetailScreen from '../screens/FieldDetailScreen';
import FieldFormScreen from '../screens/FieldFormScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="FieldList"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 17,
          color: colors.textPrimary,
        },
        headerTintColor: colors.primaryDark,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="FieldList"
        component={FieldListScreen}
        options={{
          headerShown: false, // Sử dụng custom header tinh tế tại FieldListScreen
        }}
      />
      <Stack.Screen
        name="FieldDetail"
        component={FieldDetailScreen}
        options={{
          title: 'Chi Tiết Sân Bóng',
          headerBackTitle: 'Quay lại',
        }}
      />
      <Stack.Screen
        name="FieldForm"
        component={FieldFormScreen}
        options={{
          title: 'Thông Tin Sân',
          headerBackTitle: 'Quay lại',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
