<template>
  <Frame>
    <Page actionBarHidden="true" backgroundColor="#f1f0ea">
      <ScrollView>
        <StackLayout class="page">
          <GridLayout columns="*, auto" class="masthead">
            <Label col="0" text="N / TYPE STUDY" class="masthead-brand" />
            <Label col="1" text="FIELD NOTE  001" class="masthead-index" />
          </GridLayout>

          <StackLayout class="hero">
            <GridLayout columns="*, auto" class="hero-top">
              <Label col="0" text="A NATIVE TYPES EXPERIMENT" class="hero-eyebrow" />
              <Label col="1" text="01" class="hero-arrow" />
            </GridLayout>
            <Label text="THE CHECK" class="hero-title" />
            <Label text="GETS QUICKER." class="hero-title hero-title-next" />
            <Label text="A Rust TypeScript checker meets NativeScript's iOS and Android type graph." class="hero-description" textWrap="true" />
            <GridLayout columns="auto, *" class="hero-result">
              <Label col="0" :text="speedup" class="hero-number" />
              <StackLayout col="1" class="hero-unit">
                <Label text="×" class="hero-times" />
                <Label text="FASTER" class="hero-faster" />
              </StackLayout>
            </GridLayout>
            <GridLayout columns="*, auto" class="hero-foot">
              <Label col="0" text="TSRS  /  TYPESCRIPT 7.1 BETA" class="hero-foot-text" />
              <Label col="1" text="01—03" class="hero-foot-text" />
            </GridLayout>
          </StackLayout>

          <GridLayout columns="*, auto" class="section-heading">
            <Label col="0" text="01  /  ELAPSED" class="section-index" />
            <Label col="1" text="LOWER IS BETTER" class="section-note" />
          </GridLayout>
          <Label text="Typecheck, in milliseconds" class="section-title" />
          <Label text="Median of seven fresh processes, after a warmup." class="section-caption" textWrap="true" />

          <StackLayout class="measure first-measure">
            <GridLayout columns="*, auto" class="measure-line">
              <Label col="0" text="tsrs" class="measure-name" />
              <Label col="1" :text="`${tsrs.medianMs.toFixed(0)} ms`" class="measure-value" />
            </GridLayout>
            <GridLayout columns="*" class="bar-track">
              <StackLayout :width="`${timeWidth(tsrs.medianMs)}%`" class="bar bar-rust" />
            </GridLayout>
          </StackLayout>
          <StackLayout class="measure">
            <GridLayout columns="*, auto" class="measure-line">
              <Label col="0" text="TypeScript 7.1" class="measure-name" />
              <Label col="1" :text="`${tsgo.medianMs.toFixed(0)} ms`" class="measure-value" />
            </GridLayout>
            <GridLayout columns="*" class="bar-track">
              <StackLayout width="100%" class="bar bar-go" />
            </GridLayout>
          </StackLayout>

          <GridLayout columns="*, auto" class="section-heading memory-heading">
            <Label col="0" text="02  /  MEMORY" class="section-index" />
            <Label col="1" text="LOWER IS BETTER" class="section-note" />
          </GridLayout>
          <Label text="Peak resident memory" class="section-title" />
          <Label text="Median peak RSS across the same seven runs." class="section-caption" textWrap="true" />

          <StackLayout class="measure first-measure">
            <GridLayout columns="*, auto" class="measure-line">
              <Label col="0" text="tsrs" class="measure-name" />
              <Label col="1" :text="`${tsrs.medianPeakRssMiB.toFixed(0)} MiB`" class="measure-value" />
            </GridLayout>
            <GridLayout columns="*" class="bar-track">
              <StackLayout :width="`${memoryWidth}%`" class="bar bar-rust" />
            </GridLayout>
          </StackLayout>
          <StackLayout class="measure">
            <GridLayout columns="*, auto" class="measure-line">
              <Label col="0" text="TypeScript 7.1" class="measure-name" />
              <Label col="1" :text="`${tsgo.medianPeakRssMiB.toFixed(0)} MiB`" class="measure-value" />
            </GridLayout>
            <GridLayout columns="*" class="bar-track">
              <StackLayout width="100%" class="bar bar-go" />
            </GridLayout>
          </StackLayout>

          <StackLayout class="workload">
            <Label text="03  /  THE LOAD" class="section-index" />
            <GridLayout columns="auto, *" class="load-main">
              <Label col="0" :text="String(result.workload.nativeDeclarations)" class="load-number" />
              <StackLayout col="1" class="load-copy">
                <Label text="NATIVE DECLARATION FILES" class="load-label" />
                <Label :text="`${result.workload.nativeDeclarationMiB.toFixed(1)} MiB of iOS + Android types`" class="load-detail" />
              </StackLayout>
            </GridLayout>
            <Label text="UIKit · SceneKit · CoreLocation · Android SDK · androidx" class="load-frameworks" textWrap="true" />
          </StackLayout>

          <StackLayout class="method">
            <Label text="THE CONDITIONS" class="method-heading" />
            <Label :text="`${result.machine.cpu}  /  ${result.machine.platform}`" class="method-line" textWrap="true" />
            <Label :text="`${result.workload.checkers} checkers each  ·  ${result.workload.repetitions} runs  ·  no emit`" class="method-line" />
            <Label text="Same NativeScript declarations and project config; skipLibCheck is on. Standard libraries differ slightly between releases. Vue SFC templates are outside this CLI check." class="method-detail" textWrap="true" />
            <GridLayout columns="*, auto" class="method-bottom">
              <Label col="0" :text="`RUN  ${runDate}`" class="method-stamp" />
              <Label col="1" text="npm run bench  ↗" class="method-command" />
            </GridLayout>
          </StackLayout>
        </StackLayout>
      </ScrollView>
    </Page>
  </Frame>
</template>

<script setup lang="ts">
import result from '../benchmark-results.json';

const tsrs = result.compilers.tsrs;
const tsgo = result.compilers.tsgo;
const speedup = result.speedup.toFixed(2);
const memoryWidth = Math.round((tsrs.medianPeakRssMiB / tsgo.medianPeakRssMiB) * 100);
const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const recorded = new Date(result.recordedAt);
const runDate = `${recorded.getUTCDate()} ${months[recorded.getUTCMonth()]} ${recorded.getUTCFullYear()}`;

function timeWidth(value: number): number {
  return Math.round((value / tsgo.medianMs) * 100);
}

</script>
