import { jsx } from '../../../index';
import { deepMix } from '@antv/util';
import { ArcStyleProps } from '@antv/f-engine';

type ArcGuideProps = {
  points?: { x: number; y: number }[] | null;
  style?: ArcStyleProps;
  theme?: any;
};

export default (props: ArcGuideProps) => {
  const { theme = {} } = props;
  const { coord, points, style, animation } = deepMix({ ...theme.line }, props);

  const start = points[0] || {};
  const end = points[1] || {};

  const coordCenter = coord.center;
  const radius = Math.sqrt(
    (start.x - coordCenter.x) * (start.x - coordCenter.x) +
      (start.y - coordCenter.y) * (start.y - coordCenter.y)
  );

  const startAngle = Math.atan2(start.y - coordCenter.y, start.x - coordCenter.x);
  const endAngle = Math.atan2(end.y - coordCenter.y, end.x - coordCenter.x);

  return (
    <group>
      <arc
        attrs={{
          cx: coordCenter.x,
          cy: coordCenter.y,
          r: radius,
          startAngle: `${startAngle}rad`,
          endAngle: `${endAngle}rad`,
          ...style,
        }}
        animation={animation}
      />
    </group>
  );
};
