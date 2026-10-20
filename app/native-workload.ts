/**
 * A small, real NativeScript type workload for the compiler comparison.
 * This file is included by tsconfig.bench.json but has no runtime side effects.
 * The platform declarations enter through types/references.d.ts.
 */

type Surface<T> = {
  readonly [Key in keyof T as Key extends string ? Key : never]: T[Key];
};

type IOSSurface = Surface<UIView> &
  Surface<UIViewController> &
  Surface<UILabel> &
  Surface<UIButton> &
  Surface<UIColor> &
  Surface<UIImageView> &
  Surface<UIScrollView> &
  Surface<UITableView> &
  Surface<CALayer> &
  Surface<CLLocationManager> &
  Surface<SCNView> &
  Surface<NSOperationQueue>;

type AndroidSurface = Surface<android.view.View> &
  Surface<android.view.ViewGroup> &
  Surface<android.widget.TextView> &
  Surface<android.widget.Button> &
  Surface<android.widget.ImageView> &
  Surface<android.widget.ScrollView> &
  Surface<android.widget.ListView> &
  Surface<android.graphics.Canvas> &
  Surface<android.graphics.Paint> &
  Surface<android.location.LocationManager> &
  Surface<android.app.Activity> &
  Surface<android.os.Handler> &
  Surface<androidx.core.view.ViewCompat>;

type PlatformSnapshot<T> = {
  [Key in keyof T]: T[Key] extends (...args: infer Args) => infer Result
    ? { arguments: Args; result: Result }
    : T[Key];
};

export type NativeTypeWorkload = {
  ios: PlatformSnapshot<IOSSurface>;
  android: PlatformSnapshot<AndroidSurface>;
};
