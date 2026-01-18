// EmployeeIDCard - Enhanced employee ID configuration card
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, TextInput, Button, useTheme } from 'react-native-paper';
import { designTokens } from '../theme/theme';

interface EmployeeIDCardProps {
  employeeId: string;
  onSave: (id: string) => void;
  style?: any;
}

export const EmployeeIDCard: React.FC<EmployeeIDCardProps> = ({
  employeeId,
  onSave,
  style,
}) => {
  const theme = useTheme();
  const [localId, setLocalId] = React.useState(employeeId);

  return (
    <Card style={[styles.card, style]}>
      <Card.Title
        title="Employee Configuration"
        titleVariant="titleLarge"
        left={(props) => (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>👤</Text>
          </View>
        )}
      />
      <Card.Content>
        <TextInput
          label="Employee ID"
          value={localId}
          onChangeText={setLocalId}
          mode="outlined"
          style={styles.input}
          outlineStyle={styles.inputOutline}
          placeholder="Enter your employee ID"
        />
        <Button
          mode="contained"
          onPress={() => onSave(localId)}
          style={styles.button}
          contentStyle={styles.buttonContent}
          buttonColor={designTokens.colors.primary}
          textColor={designTokens.colors.text.inverse}
        >
          ✅ Save Employee ID
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    ...designTokens.shadows.md,
    borderRadius: designTokens.borderRadius.lg,
    marginHorizontal: designTokens.spacing.md,
    marginTop: designTokens.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: designTokens.spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  input: {
    marginBottom: designTokens.spacing.md,
  },
  inputOutline: {
    borderRadius: designTokens.borderRadius.md,
    borderColor: designTokens.colors.border,
  },
  button: {
    ...designTokens.shadows.sm,
    borderRadius: designTokens.borderRadius.md,
  },
  buttonContent: {
    paddingVertical: designTokens.spacing.sm,
  },
});
