---
title: SwiftUI @Environment and @Bindable
date: 2026-05-05
---

@Environment(DataModel.self) gets an observable model from the environment.
It lets the view read values, so SwiftUI can update when those values change.

It does not create bindings.
That means $dataModel.count is not available from @Environment alone.

@Bindable adds the missing binding projection:

```swift
@Environment(DataModel.self) private var environmentDataModel

var body: some View {
    @Bindable var dataModel = environmentDataModel

    IncrementButton(count: $dataModel.count)
}
```

Use @Bindable when you need to pass one of the model's mutable properties to
something that expects a Binding, such as TextField, Toggle, Stepper, or
a child view with an @Binding property.

In short:

- @Observable makes the model observable.
- @Environment retrieves the model.
- @Bindable lets you create bindings to the model's properties.
