import type { Flow, FlowStep } from '@frigade/js'

import { TourProps } from '.'
import { useFlowHandlers } from '../../hooks/useFlowHandlers'
import { useStepHandlers } from '../../hooks/useStepHandlers'

import { Flex } from '../Flex'
import { Tooltip } from '../Tooltip'

export interface TourStepProps extends Omit<TourProps, 'flowId'> {
  step: FlowStep
  flow: Flow
}

export function TourStep({
  dismissible = true,
  flow,
  onDismiss,
  onPrimary,
  onSecondary,
  step,
  ...props
}: TourStepProps) {
  const { handleDismiss } = useFlowHandlers(flow, {
    onDismiss,
  })

  const { handlePrimary, handleSecondary } = useStepHandlers(step, {
    onPrimary,
    onSecondary,
  })

  return (
    <Tooltip
      key={step.id}
      anchor={step.selector as string}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onPointerDownOutside={(e) => e.preventDefault()}
      {...props}
    >
      {dismissible && <Tooltip.Close onClick={handleDismiss} />}

      <Tooltip.Media
        src={step.videoUri ?? step.imageUri}
        type={step.videoUri ? 'video' : 'image'}
      />

      <Tooltip.Title>{step.title}</Tooltip.Title>
      <Tooltip.Subtitle>{step.subtitle}</Tooltip.Subtitle>

      <Flex.Row alignItems="center" gap={3} justifyContent="flex-end" part="tooltip-footer" pt={4}>
        <Tooltip.Progress>{`${
          flow.getNumberOfCompletedSteps() + 1
        }/${flow.getNumberOfAvailableSteps()}`}</Tooltip.Progress>

        <Tooltip.Secondary
          marginLeft="auto"
          title={step.secondaryButtonTitle}
          onClick={handleSecondary}
        />
        <Tooltip.Primary title={step.primaryButtonTitle} onClick={handlePrimary} />
      </Flex.Row>
    </Tooltip>
  )
}
