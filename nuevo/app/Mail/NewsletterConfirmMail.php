<?php

namespace App\Mail;

use App\Models\NewsletterSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewsletterConfirmMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public NewsletterSubscription $subscription;

    public function __construct(NewsletterSubscription $subscription)
    {
        $this->subscription = $subscription;
    }

    public function build(): self
    {
        $url = route('newsletter.confirm', $this->subscription->token);
        return $this
            ->subject('Confirma tu suscripción - '.config('app.name'))
            ->view('emails.newsletter.confirm')
            ->with([
                'confirmUrl' => $url,
                'email' => $this->subscription->email,
                'appName' => config('app.name'),
            ]);
    }
}

