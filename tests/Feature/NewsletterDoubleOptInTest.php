<?php

use App\Mail\NewsletterConfirmMail;
use App\Models\NewsletterSubscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

it('stores a pending subscription and sends confirmation email', function () {
    Mail::fake();

    $email = 'test@example.com';

    $response = $this->post('/newsletter-subscriptions', [
        'email' => $email,
        'consent' => true,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('newsletter_subscriptions', [
        'email' => $email,
        'status' => 'pending',
    ]);

    Mail::assertQueued(NewsletterConfirmMail::class);
});

it('confirms a subscription with valid token', function () {
    $sub = NewsletterSubscription::create([
        'email' => 'foo@bar.com',
        'status' => 'pending',
        'token' => Str::random(40),
        'consented_at' => now(),
    ]);

    $response = $this->get(route('newsletter.confirm', $sub->token));

    $response->assertRedirect();

    $this->assertDatabaseHas('newsletter_subscriptions', [
        'id' => $sub->id,
        'status' => 'confirmed',
    ]);
});

