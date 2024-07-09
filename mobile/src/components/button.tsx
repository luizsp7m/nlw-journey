import clsx from 'clsx'

import {
  Text,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ActivityIndicator,
} from 'react-native'

import { createContext, useContext } from 'react'

type Variants = 'primary' | 'secondary'

type ButtonProps = TouchableOpacityProps & {
  variant?: Variants
  isLoading?: boolean
}

const ThemeContext = createContext({} as { variant: Variants })

function Button({
  variant = 'primary',
  isLoading = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <ThemeContext.Provider
      value={{
        variant,
      }}
    >
      <TouchableOpacity disabled={isLoading} activeOpacity={0.7} {...props}>
        <View
          className={clsx(
            'h-11 flex-row items-center justify-center rounded-lg gap-2',
            {
              'bg-lime-300': variant === 'primary',
              'bg-zinc-800': variant === 'secondary',
            },
          )}
        >
          {isLoading ? (
            <ActivityIndicator className="text-lime-950" />
          ) : (
            children
          )}
        </View>
      </TouchableOpacity>
    </ThemeContext.Provider>
  )
}

function Title({ children }: TextProps) {
  const { variant } = useContext(ThemeContext)

  return (
    <Text
      className={clsx(
        '',
        { 'text-lime-950': variant === 'primary' },
        { 'text-zinc-200': variant === 'secondary' },
      )}
    >
      {children}
    </Text>
  )
}

Button.Title = Title

export { Button }
