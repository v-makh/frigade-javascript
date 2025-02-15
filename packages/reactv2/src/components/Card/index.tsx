import * as React from 'react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import { EmotionJSX } from '@emotion/react/types/jsx-namespace'

import { Button, type ButtonProps } from '../Button'
import { Flex } from '../Flex'
import { FlowCard } from './FlowCard'
import { Media, type MediaProps } from '../Media'
import { Text, type TextProps } from '../Text'

import { type FlowComponentProps } from '@/shared/types'

interface CardComponent
  extends ForwardRefExoticComponent<Omit<FlowComponentProps, 'ref'> & RefAttributes<unknown>> {
  Media: (props: MediaProps) => EmotionJSX.Element
  Primary: (props: ButtonProps) => EmotionJSX.Element
  Secondary: (props: ButtonProps) => EmotionJSX.Element
  Subtitle: (props: TextProps) => EmotionJSX.Element
  Title: (props: TextProps) => EmotionJSX.Element
}

export const Card = React.forwardRef(({ as, children, ...props }: FlowComponentProps, ref) => {
  // If props.flowId is set, render FlowCard instead
  if (props.flowId != null) {
    return <FlowCard as={as} {...props} />
  }

  const Component = as ?? Flex.Column
  return (
    <Component
      backgroundColor="neutral.background"
      borderRadius="md"
      gap={5}
      p={5}
      {...props}
      ref={ref}
    >
      {children}
    </Component>
  )
}) as CardComponent

Card.Media = ({ src, ...props }: MediaProps) => {
  if (src == null) return null

  return <Media borderRadius="md" src={src} {...props} />
}

Card.Primary = ({ onClick, title, ...props }: ButtonProps) => {
  if (title == null) return null

  return <Button.Primary title={title} onClick={onClick} {...props} />
}

Card.Secondary = ({ onClick, title, ...props }: ButtonProps) => {
  if (title == null) return null

  return <Button.Secondary title={title} onClick={onClick} {...props} />
}

Card.Subtitle = ({ children, ...props }: TextProps) => {
  if (children == null) return null

  return (
    <Text.Body2 display="block" part="subtitle" mt={1} {...props}>
      {children}
    </Text.Body2>
  )
}

Card.Title = ({ children, ...props }: TextProps) => {
  if (children == null) return null

  return (
    <Text.Body1 display="block" fontWeight="bold" part="title" {...props}>
      {children}
    </Text.Body1>
  )
}
