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

<h3>Persistent homology to study phase transitions</h3>
<p>
	One potential application of persistent homology that has not yet fully been explored is in studing phase transitions in lattice models from statistical mechanics. The idea of this project is to build up a methodology for using persistent homology with well-understood lattice models such as the XY model, with the hope that this could eventually help us towards understanding the behaviour and phase transitions of more complex models like lattice QCD.
</p><p>
	To get a flavour of what the persistence of the XY model tells us, I wrote a small web app that can be found <a href="{{ site.baseurl }}/xy-model/">here</a>.

	<a href="{{ site.baseurl }}/xy-model/"><img src="{{ site.baseurl }}/files/images/xy_applet.png" style="width: 60%; display: block; margin-left: auto; margin-right: auto; margin-top: 15px;"/></a>
</p>

<h3>Other projects</h3>
<p>
In other projects I am looking at:
<ul>
  <li>varieties of polynomials in the triangle hyperfield with <a href="https://sites.google.com/view/jmacademicsite/home">James Maxwell</a>.</li>
</ul>
</p>

<div class="vallenato">
<h2 style="text-align: center;">Publications</h2>
<div class="vallenato-header">
Quantitative analysis of phase transitions in two-dimensional XY models using persistent homology
</div><!--/.vallenato-header-->

<div class="vallenato-content">
	<p>with <a href="https://sites.google.com/view/jeffreygiansiracusa/home">Jeff Giansiracusa</a> and <a href="http://pyweb.swan.ac.uk/~pybl/">Biagio Lucini</a>.</p>

<p>We use persistent homology and persistence images as an observable of three different variants of the two-dimensional XY model in order to identify and study their phase transitions. We examine models with the classical XY action, a topological lattice action, and an action with an additional nematic term. In particular, we introduce a new way of computing the persistent homology of lattice spin model configurations and, by considering the fluctuations in the output of logistic regression and k-nearest neighbours models trained on persistence images, we develop a methodology to extract estimates of the critical temperature and the critical exponent of the correlation length. We put particular emphasis on finite-size scaling behaviour and producing estimates with quantifiable error. For each model we successfully identify its phase transition(s) and are able to get an accurate determination of the critical temperatures and critical exponents of the correlation length.</p>

	<p><a href="https://journals.aps.org/pre/abstract/10.1103/PhysRevE.105.024121">Publisher</a>, <a href="https://arxiv.org/abs/2109.10960">arXiv</a>.</p>
</div><!--/.vallenato-content-->
  
</div><!--/.vallenato-->

<div class="vallenato">
<h2 style="text-align: center;">Dissertation</h2>
<div class="vallenato-header">
Masters: Synthetic Homotopy Theory and Classifying Principal Bundles in Homotopy Type Theory
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
