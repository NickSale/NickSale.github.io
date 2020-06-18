---
layout: archive
title: "Research"
permalink: /research/
author_profile: true
---

{% if author.googlescholar %}
  You can also find my articles on <u><a href="{{author.googlescholar}}">my Google Scholar profile</a>.</u>
{% endif %}

{% include base_path %}

<script
  src="https://code.jquery.com/jquery-3.4.1.min.js"
  integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
  crossorigin="anonymous"></script>

<link rel="stylesheet" href="{{ site.baseurl }}/assets/vallenato/vallenato.css">
<script src='https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML' async></script>
<script src="{{ site.baseurl }}/assets/vallenato/vallenato.js"></script>

I'm interested in how topological data analysis can be applied to obtain value from data by considering its shape. On the one hand, this consists of identifying new domains where TDA can improve data analysis, especially when it solves problems that other data analysis techniques can not. On the other hand, this involves investigating where tools like persistent homology and (ball) mapper fit into the data scientist's toolbox, especially alongside the wide variety of manifold learning techniques out there.

<h4>Persistent homology to study phase transitions</h4>
One potential application of persistent homology that has not yet fully been explored is in studing phase transitions in lattice models from statistical mechanics. The idea of this project is to build up a methodology for using persistent homology with well-understood lattice models such as the XY model, with the hope that this could eventually help us towards understanding the behaviour and phase transitions of more complex models like lattice QCD.

<p>
In other projects I am looking at:
<ul>
  <li>the application of persistent homology to identifying families of statistical distributions;</li>
  <li>the relationship between topological data analysis and diffusion-based analysis.</li>
</ul>
</p>

<div class="vallenato">
<h2 style="text-align: center;">Dissertation</h2>
<div class="vallenato-header">
Synthetic Homotopy Theory and Classifying Principal Bundles in Homotopy Type Theory
</div><!--/.vallenato-header-->

<div class="vallenato-content">
<p>My masters dissertation, written over the course of Hilary Term 2019. It introduces homotopy type theory and looks at doing <i>synthetic</i> homotopy theory, focussing particularly on defining fibre bundles. The main result is a proof in homotopy type theory of a theorem originally due to Gottlieb. It gives the homotopy groups of the path components of the space $Map(X, K(G,1))$, where $X$ is any space and $K(G,1)$ is the classifying space of a discrete group $G$.</p>

<p>Submitted in April 2019. <a href="{{ site.baseurl }}/files/dissertation.pdf">Download</a>.</p>
</div><!--/.vallenato-content-->
  
</div><!--/.vallenato-->

<script>
$(document).ready(function() {
	vallenato();
});
</script>
